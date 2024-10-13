import { Markup, Scenes } from 'telegraf';

export interface AmountWizardSession extends Scenes.WizardSessionData {
    amount?: string;
    comment?: string;
}

export const amountAndCommentWizard = new Scenes.WizardScene<Scenes.WizardContext<AmountWizardSession>>(
    'amount-and-comment-wizard',
    async (ctx) => {
        await ctx.reply(ctx.from?.username + ' Введите сумму:');
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            ctx.scene.session.amount = ctx.message.text;
            await ctx.reply('Введите комментарий:');
            return ctx.wizard.next();
        } else {
            await ctx.reply(ctx.from?.username + ' Пожалуйста, введите корректное текстовое сообщение.');
        }
    },
    async (ctx) => {
        if (ctx.message && 'text' in ctx.message) {
            ctx.scene.session.comment = ctx.message.text;
            await ctx.reply(
                `Вы ввели сумму: ${ctx.scene.session.amount} и комментарий: ${ctx.scene.session.comment}. Подтвердить? (да/нет)`,
                Markup.inlineKeyboard([
                    Markup.button.callback('Да', 'confirm'),
                    Markup.button.callback('Нет', 'cancel'),
                ]),
            );
            return ctx.wizard.next();
        } else {
            await ctx.reply('Пожалуйста, введите корректное текстовое сообщение.');
        }
    },
    async (ctx) => {
        if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
            const callbackData = ctx.callbackQuery.data;
            if (callbackData === 'confirm') {
                await ctx.reply('OK');
            } else {
                await ctx.reply('Отменено.');
            }
            await ctx.answerCbQuery();
        } else {
            await ctx.reply('Произошла ошибка, попробуйте снова.');
        }
        return ctx.scene.leave();
    },
);
