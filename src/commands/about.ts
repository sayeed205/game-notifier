import DEBUG from 'debug';
const { author, homepage, name, version } = require('../../package.json');
const debug = DEBUG('bot:about_command');

export const about = () => (ctx: any) => {
    const message = `*${name} ${version}*\n${author}\n${homepage}`;
    debug(`Triggered "about" command with message \n${message}`);

    return ctx.replyWithMarkdown(message);
};
