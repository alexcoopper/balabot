import { Markup, Scenes } from 'telegraf';
import { GoogleSheetsService } from '../services/GoogleSheetsService';

export interface BalanceWizardSession extends Scenes.WizardSessionData {
    period?: string;
}

const askPeriodStep = async (ctx: Scenes.WizardContext<BalanceWizardSession>) => {
    await ctx.reply(
        'Оберіть період для розрахунку балансу:',
        Markup.inlineKeyboard([
            [Markup.button.callback('Усі записи', 'All')],
            [Markup.button.callback('Лише завершені', 'Done')],
            [Markup.button.callback('Лише в процесі', 'In progress')],
        ]),
    );
    return ctx.wizard.next();
};

const showBalanceStep = async (ctx: Scenes.WizardContext<BalanceWizardSession>) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const period = ctx.callbackQuery.data;

        ctx.scene.session.period = period;

        const googleSheetsService = await GoogleSheetsService.create();

        const userName = ctx.from?.username || '';
        const userMappings = await googleSheetsService.getUserExpenseMappings();
        const balanceOwner = userMappings[userName];

        if (!balanceOwner) {
            await ctx.reply('У вас немає прав для перегляду балансу.');
            return ctx.scene.leave();
        }

        const balanceSummary = await googleSheetsService.getBalanceByOwnerAndPeriod(balanceOwner, period);

        if (!balanceSummary) {
            await ctx.reply('Немає записів балансу для цього періоду.');
            return ctx.scene.leave();
        }

        let message = `*Баланс для ${balanceOwner} за період "${period}":*\n\n`;
        message += `Всього витратив: \`${balanceSummary.sumAll.toFixed(2)}\`\n`;
        message += `- Витрати на спільне: \`${balanceSummary.sumCommon.toFixed(2)}\`\n`;
        message += `- Витрати на брата: \`${balanceSummary.spentToBrother.toFixed(2)}\`\n`;
        message += `- Загальний борг брата: \`${balanceSummary.totalSpentToBrother.toFixed(2)}\`\n\n`;
        message += `Баланс: \`${balanceSummary.balance.toFixed(2)}\`\n`;

        await ctx.reply(message, { parse_mode: 'Markdown' });
        await ctx.answerCbQuery();
    }

    return ctx.scene.leave();
};

export const balanceWizard = new Scenes.WizardScene<Scenes.WizardContext<BalanceWizardSession>>(
    'balance-wizard',
    askPeriodStep,
    showBalanceStep,
);
