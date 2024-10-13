import { Context, MiddlewareFn } from 'telegraf';

export class AuthorizationMiddleware {
    private static authorizedUserIds: number[];

    // Static method to initialize the class with authorized user IDs
    public static initialize() {
        this.authorizedUserIds = (process.env.AUTHORIZED_USERS || '').split(',').map(Number);
    }

    // Check if the user is authorized (static method)
    private static isAuthorized(ctx: Context): boolean {
        const userId = ctx.from?.id;
        return this.authorizedUserIds.includes(userId || 0);
    }

    // Send unauthorized message (static method)
    private static sendUnauthorizedMessage(ctx: Context): void {
        ctx.reply('You are not authorized to use this bot.');
    }

    // Static middleware function for authorization
    public static authorize: MiddlewareFn<Context> = (ctx, next) => {
        if (!this.isAuthorized(ctx)) {
            this.sendUnauthorizedMessage(ctx);
        } else {
            return next(); // Continue to the next action
        }
    };
}
