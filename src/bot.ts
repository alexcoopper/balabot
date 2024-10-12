import { Telegraf } from 'telegraf';
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

AuthorizationMiddleware.initialize();

// Initialize the bot
const bot = new Telegraf(botToken);
bot.use(LogMiddleware.log);
bot.use(AuthorizationMiddleware.authorize);

bot.on('document', handleDocumentUpload);
bot.on('message', handleMessage);

bot.catch(ErrorMiddleware.handleError);

// Determine whether to use webhook (production) or polling (development)
if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode with webhooks.');

    // Exported function for Google Cloud Functions (Webhook)
    exports.telegramBot = functions.http('telegramBot', (req: any, res: any) => {
        HttpService.handleTelegramBot(req, res, bot);
    });

    // Exported function for Google Cloud Scheduler (Scheduled Notifications)
    exports.scheduledNotification = functions.http('scheduledNotification', (req: any, res: any) => {
        HttpService.handleScheduledNotification(res, NotificationService);
    });

} else {
    console.log('Running in development mode with polling.');

    // Start bot with polling in development mode
    bot.launch().then(() => {
        console.log('Bot is running locally with polling...');
    });

    // Catch termination signals in development mode
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
