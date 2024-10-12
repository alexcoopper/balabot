import axios from 'axios';
import { isWithinInterval, set } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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

        // Temporarily return a list with only the first user
        return authorizedUsers.slice(0, 1);
    }

    // Define notification time ranges and messages
    private static notificationRules = [
        {
            days: [2], // Tuesday (1 = Monday, 2 = Tuesday, etc.)
            startTime: '20:00',
            endTime: '22:00',
            message: "Не забудьте викотити баки!"
        },
        {
            days: [1, 2, 3, 4, 5], // Weekdays (Monday to Friday)
            startTime: '10:30',
            endTime: '12:00',
            message: 'Щоденне нагадування'
        },
    ];

    // Get the current time in Kyiv, Ukraine
    private static getCurrentDateTimeInUkraine(): Date {
        const now = new Date();
        return toZonedTime(now, 'Europe/Kiev');
    }

    // Find the appropriate notification message based on the current date and time
    private static getNotificationMessage(): string {
        const now = NotificationService.getCurrentDateTimeInUkraine();
        const currentDay = now.getDay(); // Day of the week (0 = Sunday, 1 = Monday, etc.)

        for (const rule of NotificationService.notificationRules) {
            if (rule.days.includes(currentDay)) {
                const startTimeParts = rule.startTime.split(':');
                const endTimeParts = rule.endTime.split(':');
                
                const start = set(now, { hours: parseInt(startTimeParts[0]), minutes: parseInt(startTimeParts[1]), seconds: 0 });
                const end = set(now, { hours: parseInt(endTimeParts[0]), minutes: parseInt(endTimeParts[1]), seconds: 0 });

                if (isWithinInterval(now, { start, end })) {
                    return rule.message;
                }
            }
        }

        return "Тестове повідомлення!";
    }

    // Send notifications to all authorized users
    static async sendNotificationToUsers() {
        const message = NotificationService.getNotificationMessage();
        
        const promises = NotificationService.authorizedUserIds.map(userId => {
            const url = `https://api.telegram.org/bot${NotificationService.botToken}/sendMessage`;
            const data = {
                chat_id: userId,
                text: message
            };
            return axios.post(url, data);
        });

        await Promise.all(promises);
        console.log(`Notification sent: "${message}"`);
    }
}
