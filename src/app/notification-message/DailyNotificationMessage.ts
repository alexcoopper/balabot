import { NotificationMessage } from './NotificationMessage';

export class DailyNotificationMessage extends NotificationMessage {
    build(): string {
        return "This is your daily notification!";
    }
}
