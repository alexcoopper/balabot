import { Markup, Scenes, session, Telegraf } from 'telegraf';
import * as functions from '@google-cloud/functions-framework'; // Google Cloud Functions framework
import { AuthorizationMiddleware } from './app/middlewares/AuthorizationMiddleware';
import { NotificationService } from './app/services/NotificationService';
import { HttpService } from './app/services/HttpService';
import { LogMiddleware } from './app/middlewares/LogMiddleware';
import { ErrorMiddleware } from './app/middlewares/ErrorMiddleware';
import { handleDocumentUpload } from './app/bot-handlers/documentHandler';
import { handleMessage } from './app/bot-handlers/messageHandler';

// Conditionally load environment variables in local development
if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv');
    dotenv.config(); // Load from .env for development
}

const botToken = process.env.BOT_TOKEN;
const spreadsheetId = process.env.SPREADSHEET_ID;

if (!botToken || !spreadsheetId) {
    throw new Error('Bot token or Spreadsheet ID is not set. Please set both in environment variables.');
}

const bot = new Telegraf<MyContext>(botToken);

AuthorizationMiddleware.initialize();
bot.use(LogMiddleware.log);
bot.use(AuthorizationMiddleware.authorize);

// Расширяем стандартный контекст Telegraf для поддержки сцен
interface MyWizardSession extends Scenes.WizardSessionData {
    amount?: string;
    comment?: string;
}

interface MyContext extends Scenes.WizardContext<MyWizardSession> {}

const amountAndCommentWizard = new Scenes.WizardScene<MyContext>(
    'amount-and-comment-wizard',
    async (ctx) => {
        await ctx.reply(ctx.from?.username + 'Введите сумму:');
        return ctx.wizard.next(); // Переход к следующему шагу
    },
    async (ctx) => {
        // Проверяем, что сообщение содержит текст
        if (ctx.message && 'text' in ctx.message) {
            ctx.scene.session.amount = ctx.message.text; // Сохраняем сумму в сессию
            await ctx.reply('Введите комментарий:');
            return ctx.wizard.next();
        } else {
            await ctx.reply(ctx.from?.username + 'Пожалуйста, введите корректное текстовое сообщение.');
        }
    },
    async (ctx) => {
        // Проверяем, что сообщение содержит текст
        if (ctx.message && 'text' in ctx.message) {
            ctx.scene.session.comment = ctx.message.text; // Сохраняем комментарий в сессию
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
        // Проверяем, что в callbackQuery есть поле data
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
        return ctx.scene.leave(); // Выход из сцены
    },
);

const stage = new Scenes.Stage<MyContext>([amountAndCommentWizard]);

bot.use(session());
bot.use(stage.middleware());

bot.command('command1', (ctx) => ctx.scene.enter('amount-and-comment-wizard'));

bot.on('document', handleDocumentUpload);
bot.on('message', handleMessage);

bot.on('callback_query', async (ctx, next) => {
    console.log('Received callback query:', ctx.callbackQuery);
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        await ctx.answerCbQuery();
    }
});

bot.catch(ErrorMiddleware.handleError);

if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode with webhooks.');

    exports.telegramBot = functions.http('telegramBot', (req: any, res: any) => {
        HttpService.handleTelegramBot(req, res, bot);
    });

    exports.scheduledNotification = functions.http('scheduledNotification', (req: any, res: any) => {
        HttpService.handleScheduledNotification(res, NotificationService);
    });
} else {
    console.log('Running in development mode with polling.');

    bot.launch().then(() => {
        console.log('Bot is running locally with polling...');
    });

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
