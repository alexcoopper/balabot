import { Telegraf } from 'telegraf';
import { GoogleSheetsService } from './app/services/GoogleSheetsService';
import * as functions from '@google-cloud/functions-framework'; // Google Cloud Functions framework

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

// Initialize the bot
const bot = new Telegraf(botToken);

// Handle document uploads
bot.on('document', async (ctx) => {
    const fileId = ctx.message.document.file_id;
    const googleSheetsService = await GoogleSheetsService.create();

    await googleSheetsService.handleExcelFile(
        fileId,
        ctx.telegram,
        (message: string) => ctx.reply(message)
    );
});

// Handle status messages
bot.on('message', (ctx) => {
    if ('text' in ctx.message) {
        const messageText = ctx.message.text.toLowerCase();
        if (['status', 'stats'].includes(messageText)) {
            ctx.reply('I am alive!');
        }
    }
});

// Determine whether to use webhook (production) or polling (development)
if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode with webhooks.');

    // Exported function for Google Cloud Functions (Webhook)
    exports.telegramBot = functions.http('telegramBot', (req: any, res: any) => {
        console.log('New webhook request:', req.body);
        bot.handleUpdate(req.body)
            .then(() => res.status(200).send('OK'))
            .catch(err => {
                console.error('Error handling update:', err);
                res.status(500).send('Internal Server Error');
            });
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

