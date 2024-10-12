export class ErrorMiddleware {
    static handleError(err: any, ctx: any) {
        console.error(`Error occurred for ${ctx.updateType}:`, err);
        ctx.reply('Something went wrong. Please try again later.');
    }
}
