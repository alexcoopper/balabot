import { Markup, Scenes } from 'telegraf';
import { Expense } from '../models';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { UserMappingService } from '../services/UserMappingService';

export interface AmountWizardSession extends Scenes.WizardSessionData {
    amount?: string;
    comment?: string;
}

const askAmountAndCommentStep = async (ctx: Scenes.WizardContext<AmountWizardSession>) => {
    await ctx.reply('Введіть суму та коментар через пробіл.\n' + 'Наприклад: 150.50 покупка продуктів');
    return ctx.wizard.next();
};

const confirmStep = async (ctx: Scenes.WizardContext<AmountWizardSession>) => {
    if (ctx.message && 'text' in ctx.message) {
        const inputText = ctx.message.text.trim();
        const firstSpaceIndex = inputText.indexOf(' ');

        if (firstSpaceIndex === -1) {
            await ctx.reply('Будь ласка, введіть суму і коментар, розділені пробілом.');
            return;
        }

        const [amount, ...commentParts] = inputText.split(' ');
        const comment = commentParts.join(' ').trim();

        const normalizedAmount = amount.replace(',', '.');
        if (!normalizedAmount || isNaN(parseFloat(normalizedAmount))) {
            await ctx.reply('Будь ласка, введіть коректну суму. Використовуйте кому або крапку для копійок.');
            return;
        }

        if (!comment) {
            await ctx.reply('Будь ласка, введіть коректний коментар.');
            return;
        }

        ctx.scene.session.amount = parseFloat(normalizedAmount).toFixed(2);
        ctx.scene.session.comment = comment;

        await ctx.reply(
            `Ви ввели суму: ${ctx.scene.session.amount} та коментар: ${ctx.scene.session.comment}. Підтвердити? (так/ні)`,
            Markup.inlineKeyboard([Markup.button.callback('Так', 'confirm'), Markup.button.callback('Ні', 'cancel')]),
        );
        return ctx.wizard.next();
    } else {
        await ctx.reply('Будь ласка, введіть коректне текстове повідомлення.');
    }
};

const handleConfirmationStep = async (ctx: Scenes.WizardContext<AmountWizardSession>) => {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const callbackData = ctx.callbackQuery.data;

        if (callbackData === 'confirm') {
            const googleSheetsService = await GoogleSheetsService.create();

            const userId = ctx.from?.id || 0;
            const expenseOwner = new UserMappingService().getOwnerByUserId(userId);
            if (!expenseOwner) {
                await ctx.reply('Ви не маєте прав додавати витрати.');
                return ctx.scene.leave();
            }

            const username = ctx.from?.username || '';
            const expense = {
                Date: new Date(),
                Description: `готівка (${username}): ` + ctx.scene.session.comment,
                Sum: parseFloat(ctx.scene.session.amount || '0') * -1,
                ExpenseOwner: expenseOwner,
            } as Expense;

            await ctx.sendChatAction('typing');
            await ctx.reply('📝 Додаю дані в таблицю...');
            await googleSheetsService.WriteExpensesToSheet([expense]);
            await ctx.reply('Дані успішно додані.');
        } else {
            await ctx.reply('Дія скасована.');
        }

        await ctx.answerCbQuery();
    } else {
        await ctx.reply('Сталася помилка, спробуйте ще раз.');
    }

    return ctx.scene.leave();
};

export const amountAndCommentWizard = new Scenes.WizardScene<Scenes.WizardContext<AmountWizardSession>>(
    'amount-and-comment-wizard',
    askAmountAndCommentStep,
    confirmStep,
    handleConfirmationStep,
);
