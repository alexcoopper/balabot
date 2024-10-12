import { Context } from 'telegraf';

// Type guard to check if the message contains text
function isTextMessage(ctx: Context): ctx is Context & { message: { text: string } } {
    return ctx.message !== undefined && 'text' in ctx.message;
}

export const handleMessage = (ctx: Context) => {
    if (isTextMessage(ctx)) {
        const messageText = ctx.message.text.toLowerCase();
        if (['status', 'stats'].includes(messageText)) {
            ctx.reply('I am alive!');
        }
    } else {
        ctx.reply('Unsupported message type. Please send a text message.');
    }
};
