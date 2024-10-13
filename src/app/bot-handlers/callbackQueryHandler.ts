import { Context } from 'telegraf';

export const handleCallbackQuery = async (ctx: Context) => {
    console.log('Received callback query:', ctx.callbackQuery);
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        await ctx.answerCbQuery();
    }
};
