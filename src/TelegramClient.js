const TelegramBot = require('node-telegram-bot-api');

class TelegramClient {
    constructor(token) {
        this.bot = new TelegramBot(token);
    }

    async sendMessage(chatId, message) {
        try {
            await this.bot.sendMessage(chatId, message);
        } catch (err) {
            console.error(`Не удалось отправить сообщение ${chatId}:`, err);
        }
    }

    async sendRandomMessage(chatId, messages) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        const message = messages[randomIndex];
        await this.sendMessage(chatId, message);
    }

    async getAdminUsernames(chatId) {
        // Проверяем, что chatId принадлежит группе (отрицательное значение)
        if (chatId > 0) {
            return [];
        }

        try {
            const admins = await this.bot.getChatAdministrators(chatId);
            return admins
                .map(admin => admin.user.username)
                .filter(Boolean)
                .map(username => `@${username}`);
        } catch (error) {
            console.error('Ошибка при получении администраторов:', error);
            return [];
        }
    }

}

module.exports = TelegramClient;
