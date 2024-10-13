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

configEnv();

const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf<BalaBotContext>(botToken || '');

const privateChatCommands: BotCommand[] = [
    { command: 'setowncashe', description: 'Відмітити сумму як наше' },
    { command: 'balance', description: 'Інформація про баланс' },
];

const groupChatCommands: BotCommand[] = [{ command: 'cash', description: 'Додавання готівки' }];

bot.telegram.setMyCommands(privateChatCommands, { scope: { type: 'all_private_chats' } });
bot.telegram.setMyCommands(groupChatCommands, { scope: { type: 'all_group_chats' } });

const stage = new Scenes.Stage([amountAndCommentWizard, balanceWizard]);

bot.use(LogMiddleware.log);
bot.use(AuthorizationMiddleware.authorize);
bot.use(session());
bot.use(stage.middleware());

bot.command('cash', (ctx) => ctx.scene.enter('amount-and-comment-wizard'));
bot.command('balance', (ctx) => ctx.scene.enter('balance-wizard'));

bot.on('document', handleDocumentUpload);
bot.on('message', handleMessage);
bot.on('callback_query', handleCallbackQuery);

bot.catch(ErrorMiddleware.handleError);

configureEntryPoints(bot);
