import { NotificationType } from "../models";
import { NotificationService } from "./NotificationService";

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
            const { type } = body;

            if (!type || !(Object.values(NotificationType).includes(type))) {
                console.error('handleScheduledNotification: bad Request: "type" is required.');
                return res.status(400).send('Bad Request: "type" is required.');
            }

            await NotificationService.sendNotificationToUsers(type);
            console.log('handleScheduledNotification: scheduled notifications sent successfully.');
            res.status(200).send('Notifications sent successfully.');
        } catch (error) {
            console.error('handleScheduledNotification: error occurred during scheduled notification process:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
