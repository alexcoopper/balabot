import { NotificationMessage } from './NotificationMessage';

export class TrashReminderMessage extends NotificationMessage {
    build(): string {
        return "Don't forget to take out the trash!";
    }
}
