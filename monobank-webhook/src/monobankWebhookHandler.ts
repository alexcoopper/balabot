import { CloudTasksClient } from "@google-cloud/tasks";
import { v4 as uuidv4 } from 'uuid';

export async function handleMonobankWebhook(req: any, res: any) {
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
        const queue = 'monobank-transaction-queue';

        const parent = client.queuePath(projectId, location, queue);
        const task = {
            httpRequest: {
                httpMethod: 'POST' as const,
                url: 'https://us-central1-expensemanager-437923.cloudfunctions.net/scheduledNotification',
                headers: { 'Content-Type': 'application/json' },
                body: Buffer.from(JSON.stringify(payload)).toString('base64')
            },
            name: client.taskPath(projectId, location, queue, uuidv4())
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

console.log('A new instance of a function has been started.');
