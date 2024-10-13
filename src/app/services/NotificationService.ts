import axios from 'axios';
import { NotificationType } from '../models';
import { NotificationMessageFactory } from '../notification-message/NotificationMessageFactory';

export class NotificationService {
    private static get botToken(): string {
        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            throw new Error('BOT_TOKEN environment variable is not set.');
        }
        return botToken;
    }

    private static get authorizedUserIds(): string[] {
        const users = process.env.AUTHORIZED_USERS;
        if (!users) {
            throw new Error('AUTHORIZED_USERS environment variable is not set.');
        }

        const authorizedUsers = users.split(',').map(userId => userId.trim());

        return authorizedUsers;
    }

    static async sendNotificationToTestGroupChat(notificationType: NotificationType) {
        await NotificationService.sendNotification(notificationType, [process.env.GROUP_CHAT_ID_TEST || '']);
    }

    static async sendNotificationToGroupChat(notificationType: NotificationType) {
        await NotificationService.sendNotification(notificationType, [process.env.GROUP_CHAT_ID || '']);
    }

    // Send notifications to all authorized users
    static async sendNotificationToUsers(notificationType: NotificationType) {
        await NotificationService.sendNotification(notificationType, NotificationService.authorizedUserIds);
    }

    private static async sendNotification(notificationType: NotificationType, users: string[]) {
        const notificationMessage = NotificationMessageFactory.create(notificationType);
        const message = await notificationMessage.build();

        const promises = users.map(userId => {
            const url = `https://api.telegram.org/bot${NotificationService.botToken}/sendMessage`;
            const data = {
                chat_id: userId,
                text: message
            };
            return axios.post(url, data);
        });

        await Promise.all(promises);
        console.log(`Notification sent: "${message}", type: ${notificationType}, to users: ${users}`);
    }
}
