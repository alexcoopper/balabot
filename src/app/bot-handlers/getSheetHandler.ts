import { Context } from 'telegraf';
import { GoogleSheetPageUrlTemplate } from '../constants';

export const getSheetHandler = async (ctx: Context) => {
    const url = GoogleSheetPageUrlTemplate.replace('{sheetId}', process.env.SPREADSHEET_ID || '');
    await ctx.reply(`Ось посилання на файл: [Відкрити](${url})`, { parse_mode: 'MarkdownV2',  link_preview_options: { is_disabled: true } });
};
