import * as functions from '@google-cloud/functions-framework';
import { HttpService } from './app/services/HttpService';
import { NotificationService } from './app/services/NotificationService';
import { Telegraf } from 'telegraf';
import { BalaBotContext } from './app/models';

export const configEnv = () => {
    if (process.env.NODE_ENV !== 'production') {
        const dotenv = require('dotenv');
        dotenv.config();
    }
};

export const configureEntryPoints = (bot: Telegraf<BalaBotContext>) => {
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
};
