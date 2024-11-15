import { format, fromUnixTime } from "date-fns";
import { Expense, ExpenseOwner, NotificationType } from "../models";
import { GoogleSheetsService } from "./GoogleSheetsService";
import { NotificationService } from "./NotificationService";
import { toZonedTime } from 'date-fns-tz';
import { CloudTasksClient } from "@google-cloud/tasks";
import { v4 as uuidv4 } from 'uuid';


export class HttpService {
    static async handleTelegramBot(req: any, res: any, bot: any) {
        try {
            console.log(`handleTelegramBot: new webhook request received. Chat ID: ${req.body?.message?.chat?.id || 'unknown'}, Update Type: ${req.body?.update_type || 'unknown'}`);
            
            await bot.handleUpdate(req.body);

            console.log('handleTelegramBot: webhook request processed successfully.');
            res.status(200).send('OK');
        } catch (err) {
            const chatId = req.body?.message?.chat?.id || 'unknown';
            const updateType = req.body?.update_type || 'unknown';
            console.error(`handleTelegramBot: error handling webhook request. Chat ID: ${chatId}, Update Type: ${updateType}. Error:`, err);

            res.status(500).send('Internal Server Error');
        }
    }

    static async handleScheduledNotification(req: any, res: any) {
        try {
            console.log('handleScheduledNotification: starting scheduled notification process...');
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { type, data } = body;

            if (!type || !(Object.values(NotificationType).includes(type))) {
                console.error('handleScheduledNotification: bad Request: "type" is required.');
                return res.status(400).send('Bad Request: "type" is required.');
            }

            if (type === NotificationType.MonobankTransaction) {
                console.log('Mono transaction:', data);
                const utcDate = fromUnixTime(data.time);
                const kyivTimezone = 'Europe/Kiev';
                const kyivDate = toZonedTime(utcDate, kyivTimezone);
            
                const expense: Expense = {
                    Date: kyivDate,
                    Description: data.description,
                    Sum: data.amount / 100,
                    ExpenseOwner: ExpenseOwner.Oleksii
                };
            
                const googleSheetsService = await GoogleSheetsService.create();
                await googleSheetsService.WriteExpensesToSheet([expense]);
                return res.status(200).send('Monobank transaction processed successfully.');
            }

            await NotificationService.sendNotificationToGroupChat(type);
            console.log('handleScheduledNotification: scheduled notifications sent successfully.');
            res.status(200).send('Notifications sent successfully.');
        } catch (error) {
            console.error('handleScheduledNotification: error occurred during scheduled notification process:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async handleMonobankWebhook(req: any, res: any) {
        try {
            const transactionUpdate = req.body;
    
            console.log('Received Monobank webhook:', transactionUpdate);
    
            if (!transactionUpdate || !transactionUpdate.data || !transactionUpdate.data.statementItem) {
                res.status(200).send('Non-mono request');
                return;
            }
    
            const payload = {
                type: 'MonobankTransaction',
                data: transactionUpdate.data.statementItem
            };
    
            // Configure Google Cloud Task client
            const client = new CloudTasksClient();
            const projectId = 'expensemanager-437923';
            const location = 'us-central1'; 
            const queue = 'monobank-transaction-queue'; // Your queue name
    
            const parent = client.queuePath(projectId, location, queue);
            const task = {
                httpRequest: {
                    httpMethod: 'POST' as const,  // Explicitly set type to 'POST'
                    url: 'https://us-central1-expensemanager-437923.cloudfunctions.net/scheduledNotification',
                    headers: { 'Content-Type': 'application/json' },
                    body: Buffer.from(JSON.stringify(payload)).toString('base64') // Base64-encoded JSON payload
                },
                name: client.taskPath(projectId, location, queue, uuidv4()) // Unique identifier for idempotency
            };
    
            // Create the task in the queue
            await client.createTask({ parent, task });
    
            // Respond immediately to Monobank
            res.status(200).send('Webhook received successfully');
        } catch (error) {
            console.error('Error processing Monobank webhook:', error);
            res.status(500).send('Failed to process webhook');
        }
    }
}


