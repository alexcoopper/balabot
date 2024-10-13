import { Context, MiddlewareFn } from 'telegraf';
import { UserMappingService } from '../services/UserMappingService';

export class AuthorizationMiddleware {
    // Check if the user is authorized (static method)
    private static isAuthorized(ctx: Context): boolean {
        const users = new UserMappingService().getAllUsers();
        const userId = ctx.from?.id;
        return users.includes(userId || 0);
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
