import { NotificationType } from '../models';
import { CacheAddedNotificationMessage } from './CacheAddedNotificationMessage';
import { DailyNotificationMessage } from './DailyNotificationMessage';
import { HealthyMessage } from './HealthyMessage';
import { NotificationMessage } from './NotificationMessage';
import { TrashReminderMessage } from './TrashReminderMessage';

export class NotificationMessageFactory {
    static create(notificationType: NotificationType): NotificationMessage {
        switch (notificationType) {
            case NotificationType.DailyNotification:
                return new DailyNotificationMessage();
            case NotificationType.TrashReminder:
                return new TrashReminderMessage();
            case NotificationType.CacheAddedNotification:
                return new CacheAddedNotificationMessage();
            case NotificationType.HealthyMessage:
                return new HealthyMessage();
            default:
                throw new Error('Unsupported notification type.');
        }
    }
}
