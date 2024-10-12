import { NotificationType } from '../models';
import { DailyNotificationMessage } from './DailyNotificationMessage';
import { NotificationMessage } from './NotificationMessage';
import { TrashReminderMessage } from './TrashReminderMessage';

export class NotificationMessageFactory {
    static create(notificationType: NotificationType): NotificationMessage {
        switch (notificationType) {
            case NotificationType.DailyNotification:
                return new DailyNotificationMessage();
            case NotificationType.TrashReminder:
                return new TrashReminderMessage();
            default:
                throw new Error('Unsupported notification type.');
        }
    }
}
