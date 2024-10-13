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

    static async sendNotificationToTestGroupChat(notificationType: NotificationType) {
        await NotificationService.sendNotification(notificationType, [
            parseInt(process.env.GROUP_CHAT_ID_TEST || '', 0),
        ]);
    }

    static async sendNotificationToGroupChat(notificationType: NotificationType) {
        await NotificationService.sendNotification(notificationType, [parseInt(process.env.GROUP_CHAT_ID || '', 0)]);
    }

    // Send notifications to all authorized users
    static async sendNotificationToUsers(notificationType: NotificationType) {
        const users = new UserMappingService().getAllUsers();
        await NotificationService.sendNotification(notificationType, users);
    }

    private static async sendNotification(notificationType: NotificationType, users: number[]) {
        const notificationMessage = NotificationMessageFactory.create(notificationType);
        const message = await notificationMessage.build();

        const promises = users.map((userId) => {
            const url = `https://api.telegram.org/bot${NotificationService.botToken}/sendMessage`;
            const data = {
                chat_id: userId,
                text: message,
            };
            return axios.post(url, data);
        });

        await Promise.all(promises);
        console.log(`Notification sent: "${message}", type: ${notificationType}, to users: ${users}`);
    }
}
