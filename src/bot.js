const createRepository = require('./SubscriberRepository');
const MessageHandler = require('./MessageHandler');
const TelegramClient = require('./TelegramClient');
const PeriodicalTaskHandler = require('./PeriodicalTaskHandler');

module.exports = async () => {
    const telegramClient = new TelegramClient(process.env.TELEGRAM_BOT_TOKEN);
    const repository = await createRepository();
    const periodicalTaskHandler = new PeriodicalTaskHandler(repository, telegramClient);
    const messageHandler = new MessageHandler(repository, telegramClient);

    return {
        handleMessage: async (body) => await messageHandler.handleMessage(body),
        sendDailyQuestion: async () => await periodicalTaskHandler.sendDailyQuestion(),
        sendAlert: async () => await periodicalTaskHandler.sendAlert(),
    };
};
