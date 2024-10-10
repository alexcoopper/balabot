import { Telegraf } from 'telegraf';
import { GoogleSheetsService } from './app/services/GoogleSheetsService';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const botToken = process.env.BOT_TOKEN;
const spreadsheetId = process.env.SPREADSHEET_ID;

if (!botToken || !spreadsheetId) {
    throw new Error('Bot token or Spreadsheet ID is not set. Please set both in environment variables.');
}

(async () => {
    const bot = new Telegraf(botToken);

    // Create GoogleSheetsService instance
    const googleSheetsService = await GoogleSheetsService.create();

    // Handle document uploads
    bot.on('document', async (ctx) => {
        const fileId = ctx.message.document.file_id;
        
        await googleSheetsService.handleExcelFile(
            fileId,
            ctx.telegram,
            (message: string) => ctx.reply(message)
        );
    });

    // Handle status messages
    bot.on('message', (ctx) => {
        if ('text' in ctx.message && ctx.message.text === 'status') {
            ctx.reply('I am alive!');
        }
    });

    // Launch the bot
    await bot.launch();
    console.log('Bot is running...');
})();
