import { Context } from 'telegraf';
import { NotificationType } from '../models';
import { NotificationService } from '../services/NotificationService';

// Type guard to check if the message contains text
function isTextMessage(ctx: Context): ctx is Context & { message: { text: string } } {
    return ctx.message !== undefined && 'text' in ctx.message;
}

export const handleMessage = async (ctx: Context) => {
    if (isTextMessage(ctx)) {
        const messageText = ctx.message.text.toLowerCase();
        if (['status', 'stats'].includes(messageText)) {
            ctx.reply('I am alive!');
        }
        if (messageText === 'test -notif 1') {
            await NotificationService.sendNotificationToTestGroupChat(NotificationType.DailyNotification);
        }
        if (messageText === 'test -notif 2') {
            await NotificationService.sendNotificationToTestGroupChat(NotificationType.TrashReminder);
        }
    } else {
        ctx.reply('Unsupported message type. Please send a text message.');
    }
};
