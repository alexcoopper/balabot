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

configEnv();

const botToken = process.env.BOT_TOKEN;

const bot = new Telegraf<BalaBotContext>(botToken || '');

AuthorizationMiddleware.initialize();
const stage = new Scenes.Stage([amountAndCommentWizard]);

bot.use(LogMiddleware.log);
bot.use(AuthorizationMiddleware.authorize);
bot.use(session());
bot.use(stage.middleware());

bot.command('cash', (ctx) => ctx.scene.enter('amount-and-comment-wizard'));

bot.on('document', handleDocumentUpload);
bot.on('message', handleMessage);
bot.on('callback_query', handleCallbackQuery);

bot.catch(ErrorMiddleware.handleError);

configureEntryPoints(bot);
