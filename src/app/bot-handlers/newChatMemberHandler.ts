import { Context, NarrowedContext } from 'telegraf';
import { Update, Message } from '@telegraf/types';

export const newChatMemberHandler = async (ctx: NarrowedContext<Context, Update.MessageUpdate<Message.NewChatMembersMessage>>) => {
    const newMembers = ctx.message?.new_chat_members;
    const botId = ctx.botInfo.id;

    if (newMembers) {
        const botAdded = newMembers.some(member => member.id === botId);

        if (botAdded) {
            await ctx.reply('Привіт, кожані! 🦇 Тепер батя в чаті! 👑 Готуйте пузяки, бо тут буде спекотно! 🔥 А також, пишіть у приватні — буде гаряче... 😏');
        }
    }
};
