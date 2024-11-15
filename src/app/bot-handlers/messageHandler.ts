import { Context } from 'telegraf';
import { fromNumberToNotificationType, NotificationType } from '../models';
import { NotificationService } from '../services/NotificationService';
import { AiService } from '../services/AiService';
import { UserInfoService } from '../services/UserInfoService';

function isTextMessage(ctx: Context): ctx is Context & { message: { text: string } } {
    return ctx.message !== undefined && 'text' in ctx.message;
}

function isReplyToMessageWithText(ctx: Context): ctx is Context & { message: { text: string, reply_to_message: { from: { id: number }, text:string } } } {
    return ctx.message !== undefined && 'text' in ctx.message && 'reply_to_message' in ctx.message;
}

export const handleMessage = async (ctx: Context) => {
    if (isTextMessage(ctx)) {

        const message = ctx.message;
        const messageText = ctx.message.text.toLowerCase();
        if (['status', 'stats'].includes(messageText)) {
            await ctx.reply('I am alive!');
        }
        if (messageText.toLocaleLowerCase().includes('test notif')) {
            const parts = messageText.split(' ');

            if (parts.length > 2) {
                const typeValue = parts[2];
                const type = fromNumberToNotificationType(parseInt(typeValue));
                if(!type) {
                    await ctx.reply('Invalid notification type');
                    return;
                }
                return await NotificationService.sendNotificationToAdmin(type);
            }
        }

        const botUsername = ctx.botInfo.username;
        const isDirectMessage = message.text.includes(`@${botUsername}`);
        const from = message.from;
        const userInfo = UserInfoService.getInfo(from.id);
        if (isDirectMessage) {
            const replay = await new AiService().generateAnswerToDirectMessage(messageText.replace(`@${botUsername}`, ''), userInfo);

            if(replay != '') {
                await ctx.reply(replay, {
                    reply_to_message_id: ctx.message.message_id
                } as any);
                
                return;
            }
        }

        const isReplyToBot = isReplyToMessageWithText(ctx) && ctx.message.reply_to_message?.from?.id === ctx.botInfo.id;

        if (isReplyToBot){
            const replay = await new AiService().generateAnswerToReplayMessage(messageText, ctx.message.reply_to_message.text, userInfo);

            if(replay != '') {
                await ctx.reply(replay, {
                    reply_to_message_id: ctx.message.message_id
                } as any);

                return;
            }
        }

        if ([
            'будем', 'пити', 'чай', 'нема', 'варіант', 'номер', 'можна', 'тех', 'паспорт',
            'гривен', 'крут', 'відмовила', 'вино', 'конь', 'пізніше', 'сир', 'апарат', 'кушати', 'їсти',
            'обід', 'вечеря', 'вечір', 'цікаве', 'коньяк', 'ром', 'сухариками', 'фільм', 'серіал', 'серійк', 'зроб', 'сушарка', 
            'борщ', 'малих', 'діти', 'діт', 'пельмені', 'хліб', 'зварю', 'суп', 'залишились', 'закупи', 'атб', 'ужгород', 
            'планува', 'приїха', 'ході', 'чекал', 'грати', 'кака', 'порядки', 'страшно', 
            'стіл', 'візит', 'повідомте', 'хвилин', 'стол', 'сплат', 'привіт', 'хто', 'дивитись'
        ].some(word => messageText.includes(word))) {
            const replay = await new AiService().generateRandomMessage(messageText, userInfo);

            if(replay != '') {
                await ctx.reply(replay, {
                    reply_to_message_id: ctx.message.message_id
                } as any);

                return;
            }
        }
    }
};
