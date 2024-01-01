import { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf, Context as TelegrafContext } from 'telegraf';
import { about, greeting } from '..';
import { ok } from './responses';

const debug = require('debug')('lib:telegram');

const isDev = process.env['DEV'];

const VERCEL_URL = process.env['VERCEL_URL'];

const BOT_TOKEN = process.env['BOT_TOKEN'];

if (!BOT_TOKEN) throw new Error('please provide bot token');

export const bot = new Telegraf(BOT_TOKEN);

function botUtils() {
    bot.use(Telegraf.log());
    bot.use(logger);

    bot.start((ctx) => {
        return ctx.reply('This is a test bot.');
    });

    bot.command('about', about()).on('text', greeting());
}

async function localBot() {
    debug('Bot is running in development mode at http://localhost:3000');

    bot.telegram.webhookReply = false;

    const botInfo = await bot.telegram.getMe();
    // bot..username = botInfo.username;

    console.info('Server has initialized bot username: ', botInfo.username);

    debug(`deleting webhook`);
    await bot.telegram.deleteWebhook();

    botUtils();

    debug(`starting polling`);
    await bot.launch();
}

export async function useWebhook(req: VercelRequest, res: VercelResponse) {
    try {
        if (!isDev && !VERCEL_URL) {
            throw new Error('VERCEL_URL is not set.');
        }

        const getWebhookInfo = await bot.telegram.getWebhookInfo();

        const botInfo = await bot.telegram.getMe();
        // bot.options.username = botInfo.username;
        console.info(
            'Server has initialized bot username using Webhook. ',
            botInfo.username,
        );

        if (getWebhookInfo.url !== VERCEL_URL + '/api') {
            debug(`deleting webhook`);
            await bot.telegram.deleteWebhook();
            debug(`setting webhook to ${VERCEL_URL}/api`);
            await bot.telegram.setWebhook(`${VERCEL_URL}/api`);
        }

        // call bot commands and middleware
        botUtils();

        // console.log("webhook already defined");
        // console.log("request method: ", req.method);
        // console.log("req.body", req.body);

        if (req.method === 'POST') {
            await bot.handleUpdate(req.body, res);
        } else {
            ok(res, 'Listening to bot events...');
        }
    } catch (error) {
        console.error(error);
        return error.message;
    }
}

// export function toArgs(ctx: TelegrafContext) {
//     console.log('ctx: ', ctx);
//     // const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;
//     // const parts = regex.exec(ctx.text);
//     const parts = 'asdfasdf';
//     if (!parts) {
//         return [];
//     }
//     return !parts[3] ? [] : parts[3].split(/\s+/).filter((arg) => arg.length);
// }

// export const MARKDOWN = Extra.markdown(true) as ExtraReplyMessage;

// export const NO_PREVIEW = Extra.markdown(true).webPreview(
//     false,
// ) as ExtraReplyMessage;

export const hiddenCharacter = '\u200b';

export const logger = async (
    _: TelegrafContext,
    next: () => any,
): Promise<void> => {
    const start = new Date();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await next();
    const ms = new Date().getTime() - start.getTime();
    console.log('Response time: %sms', ms);
};

if (isDev) {
    console.log('isDev', isDev);
    localBot();
}
