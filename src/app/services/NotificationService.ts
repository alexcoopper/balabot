import axios from 'axios';
import { NotificationType } from '../models';
import { NotificationMessageFactory } from '../notification-message/NotificationMessageFactory';
import { UserMappingService } from './UserMappingService';

export class NotificationService {
    private static get botToken(): string {
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            throw new Error('BOT_TOKEN environment variable is not set.');
        }
        return botToken;
    }

    static async sendNotificationToTestGroupChat(notificationType: NotificationType, parameters?: any) {
        await NotificationService.sendNotification(notificationType, [
            parseInt(process.env.GROUP_CHAT_ID_TEST || '', 0),
        ]);
    }

    static async sendNotificationToGroupChat(notificationType: NotificationType, parameters?: any) {
        await NotificationService.sendNotification(notificationType, [parseInt(process.env.GROUP_CHAT_ID || '', 0)], parameters);
    }

    // Send notifications to all authorized users
    static async sendNotificationToUsers(notificationType: NotificationType, parameters?: any) {
        const users = new UserMappingService().getAllUsers();
        await NotificationService.sendNotification(notificationType, users, parameters);
    }

    static async sendNotificationToAdmin(notificationType: NotificationType, parameters?: any) {
        const users = new UserMappingService().getAllUsers();
        const admin = users[0];
        await NotificationService.sendNotification(notificationType, [admin], parameters);
    }

    private static async sendNotification(notificationType: NotificationType, users: number[], parameters?: any) {
        const notificationMessage = NotificationMessageFactory.create(notificationType);
        const message = await notificationMessage.build(parameters);

        if(!message) {
            console.error(`Notification message is empty for type: ${notificationType}`);
            return;
        }

        try {
            const promises = users.map((userId) => {
                const url = `https://api.telegram.org/bot${NotificationService.botToken}/sendMessage`;
                const data = {
                    chat_id: userId,
                    text: message,
                };
                return axios.post(url, data);
            });
    
            await Promise.all(promises);
        } catch (error: any) {
            console.error('Failed to send a notification. Response data:', error?.response?.data);
            return;  
        }
        console.log(`Notification sent: "${message}", type: ${notificationType}, to users: ${users}`);
    }
}
