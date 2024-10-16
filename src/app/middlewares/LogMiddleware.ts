export class LogMiddleware {
    static log(ctx: any, next: Function) {
        const chatId = ctx.chat?.id;
        const senderName = `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
        const username = (ctx.from?.username ? `(@${ctx.from.username})` : ctx.from?.first_name) || '';

        // Check if it's a text message
        if (ctx.message && 'text' in ctx.message) {
            const messageText = ctx.message.text;
            console.log(
                `Received text message from ${senderName} ${username} (chat ID: ${chatId}), message: "${messageText}"`,
            );
        }
        // Check if it's a document message
        else if (ctx.message && 'document' in ctx.message) {
            const documentName = ctx.message.document?.file_name;
            console.log(
                `Received document upload from ${senderName} ${username} (chat ID: ${chatId}), document name: "${documentName}"`,
            );
        }
        // Other types of messages (e.g., photos, stickers, etc.)
        else {
            console.log(`Received update from ${senderName} ${username} (chat ID: ${chatId}), type: ${ctx.updateType}`);
        }

        return next(); // Proceed to the next middleware or handler
    }
}
