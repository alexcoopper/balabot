export class ErrorMiddleware {
    static async handleError(err: any, ctx: any) {
        console.error(`Error occurred for ${ctx.updateType}:`, err);
        try {
            await ctx.reply('Something went wrong. Please try again later.');
        } catch (replyError) {
            console.error('Error while sending reply:', replyError);
        }
    }
}
