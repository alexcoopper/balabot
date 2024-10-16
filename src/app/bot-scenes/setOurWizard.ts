import { Markup, Scenes } from 'telegraf';
import { Expense } from '../models';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { UserMappingService } from '../services/UserMappingService';

export interface SetOurWizardSession extends Scenes.WizardSessionData {
    amount?: string;
}

const askAmountStep = async (ctx: Scenes.WizardContext<SetOurWizardSession>) => {
    await ctx.reply('Введіть суму витрат.\n' + 'Зверніть увагу: витрати автоматично позначатимуться як "Наші", якщо оплата була здійснена не пізніше ніж 3 години тому.');
    return ctx.wizard.next();
};

const confirmStep = async (ctx: Scenes.WizardContext<SetOurWizardSession>) => {
    if (ctx.message && 'text' in ctx.message) {
        const inputText = ctx.message.text.trim();
        
        const amount = inputText.trim();

        const normalizedAmount = amount.replace(',', '.');
        if (!normalizedAmount || isNaN(parseFloat(normalizedAmount))) {
            await ctx.reply('Будь ласка, введіть коректну суму. Використовуйте кому або крапку для копійок.');
            return;
        }

        ctx.scene.session.amount = parseFloat(normalizedAmount).toFixed(2);

        const userId = ctx.from?.id || 0;
        const expenseOwner = new UserMappingService().getOwnerByUserId(userId);
        if (!expenseOwner) {
            await ctx.reply('Ви не маєте прав додавати витрати.');
            return ctx.scene.leave();
        }

        const username = ctx.from?.username || ctx.from?.first_name || '';
        const expense = {
            Date: new Date(),
            Description: username,
            Sum: parseFloat(ctx.scene.session.amount || '0'),
            ExpenseOwner: expenseOwner,
        } as Expense;

        const googleSheetsService = await GoogleSheetsService.create();

        await ctx.sendChatAction('typing');
        await ctx.reply('📝 Додаю дані в таблицю...');
        await googleSheetsService.WriteOwnExpensesToSheet([expense]);
        await ctx.reply('Дані успішно додані.');
         ctx.wizard.next();
        return ctx.scene.leave();
    } else {
        await ctx.reply('Будь ласка, введіть коректне текстове повідомлення.');
    }
};


export const setOurWizard = new Scenes.WizardScene<Scenes.WizardContext<SetOurWizardSession>>(
    'set-own-wizard',
    askAmountStep,
    confirmStep,
);
