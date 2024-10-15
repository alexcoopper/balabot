import { Scenes, session, Telegraf } from 'telegraf';
import { AuthorizationMiddleware } from './app/middlewares/AuthorizationMiddleware';
import { LogMiddleware } from './app/middlewares/LogMiddleware';
import { ErrorMiddleware } from './app/middlewares/ErrorMiddleware';
import { handleDocumentUpload } from './app/bot-handlers/documentHandler';
import { handleMessage } from './app/bot-handlers/messageHandler';
import { amountAndCommentWizard, AmountWizardSession } from './app/bot-scenes/amountAndCommentWizard';
import { configEnv, configureEntryPoints } from './EnvConfig';
import { handleCallbackQuery } from './app/bot-handlers/callbackQueryHandler';
import { BalaBotContext } from './app/models';
import { BotCommand } from '@telegraf/types';
import { balanceWizard } from './app/bot-scenes/balanceWizard';
import { newChatMemberHandler } from './app/bot-handlers/newChatMemberHandler';
import { setOurWizard } from './app/bot-scenes/setOurWizard';
import { getSheetHandler } from './app/bot-handlers/getSheetHandler';

configEnv();

const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf<BalaBotContext>(botToken || '');

const privateChatCommands: BotCommand[] = [
    { command: 'cash', description: 'Додавання готівки' },
    { command: 'setowncashe', description: 'Відмітити сумму як наше' },
    { command: 'balance', description: 'Інформація про баланс' },
    { command: 'getsheet', description: 'Отримати Google таблицю' }
];

bot.telegram.setMyCommands(privateChatCommands, { scope: { type: 'all_private_chats' } });
bot.telegram.setMyCommands([], { scope: { type: 'all_group_chats' } });

const stage = new Scenes.Stage([amountAndCommentWizard, balanceWizard, setOurWizard]);

bot.use(LogMiddleware.log);
bot.use(AuthorizationMiddleware.authorize);
bot.use(session());
bot.use(stage.middleware());

bot.command('cash', (ctx) => ctx.scene.enter('amount-and-comment-wizard'));
bot.command('balance', (ctx) => ctx.scene.enter('balance-wizard'));
bot.command('setowncashe', (ctx) => ctx.scene.enter('set-own-wizard'));
bot.command('getsheet', getSheetHandler)

bot.on('new_chat_members', newChatMemberHandler);
bot.on('document', handleDocumentUpload);
bot.on('message', handleMessage);
bot.on('callback_query', handleCallbackQuery);

bot.catch(ErrorMiddleware.handleError);

configureEntryPoints(bot);
