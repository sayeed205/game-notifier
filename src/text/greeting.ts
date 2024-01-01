// const debug = require('debug')('bot:greeting_text');
import DEBUG from 'debug';
import { Context } from 'telegraf';

const debug = DEBUG('bot:greeting_text');

const replyToMessage = (ctx: any, messageId: number, string: string) =>
    ctx.reply(string, {
        reply_to_message_id: messageId,
    });

export const greeting = () => (ctx: Context) => {
    debug('Triggered "greeting" text command');

    const messageId = ctx.message.message_id;
    const userName = ctx.from.last_name
        ? `${ctx.from.first_name} ${ctx.from.last_name}`
        : ctx.from.first_name;

    replyToMessage(
        ctx,
        messageId,
        `Hello, ${userName} (user_id: ${ctx.from.id})! \n Your Message id is: ${messageId}`,
    );
};
