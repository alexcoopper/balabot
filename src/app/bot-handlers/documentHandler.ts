import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { Context } from 'telegraf';

// Type guard to check if the message contains a document
function isDocumentMessage(ctx: Context): ctx is Context & { message: { document: any } } {
    return ctx.message !== undefined && 'document' in ctx.message;
}

const isExcelFile = (fileName: string) => fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

export const handleDocumentUpload = async (ctx: Context) => {
    if (isDocumentMessage(ctx) && isExcelFile(ctx.message.document.file_name)) {
        try {
            
            const fileId = ctx.message.document.file_id;
            const googleSheetsService = await GoogleSheetsService.create();

            await googleSheetsService.handleExcelFile(fileId, ctx.telegram, (message: string) =>
                ctx.reply(message, { parse_mode: 'MarkdownV2' }),
            );
        } catch (error) {
            console.error('Error while handling document upload:', error);
            ctx.reply('Failed to upload the document. Please try again.');
        }
    }
};
