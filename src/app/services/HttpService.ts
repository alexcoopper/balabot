export class HttpService {
    static async handleTelegramBot(req: any, res: any, bot: any) {
        try {
            console.log(`New webhook request received. Chat ID: ${req.body?.message?.chat?.id || 'unknown'}, Update Type: ${req.body?.update_type || 'unknown'}`);
            
            await bot.handleUpdate(req.body);

            console.log('Webhook request processed successfully.');
            res.status(200).send('OK');
        } catch (err) {
            const chatId = req.body?.message?.chat?.id || 'unknown';
            const updateType = req.body?.update_type || 'unknown';
            console.error(`Error handling webhook request. Chat ID: ${chatId}, Update Type: ${updateType}. Error:`, err);

            res.status(500).send('Internal Server Error');
        }
    }

    static async handleScheduledNotification(res: any, notificationService: any) {
        try {
            console.log('Starting scheduled notification process...');
            await notificationService.sendNotificationToUsers();
            console.log('Scheduled notifications sent successfully.');
            res.status(200).send('Notifications sent successfully.');
        } catch (error) {
            console.error('Error occurred during scheduled notification process:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
