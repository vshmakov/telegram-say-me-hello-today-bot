const {DAILY_QUESTION_MESSAGES, WARNING_MESSAGES} = require("./messages");
const AsyncBatcher= require("./AsyncBatcher");

class PeriodicalTaskHandler {
    constructor(repository, telegramClient) {
        this.repository = repository;
        this.telegramClient = telegramClient;
        this.batch = new AsyncBatcher();
    }

    async sendDailyQuestion() {
        const subscribers = await this.repository.getAll();

        for (const subscriber of subscribers) {
            this.batch.push(async () => {
                await this.telegramClient.sendRandomMessage(subscriber.id, DAILY_QUESTION_MESSAGES);
                subscriber.expectResponse = true;
                await this.repository.update(subscriber);
            });
        }

        await this.batch.flush();
        console.log('✅ Утренний опрос отправлен');
    }

    async sendAlert() {
        const subscribers = await this.repository.getAll();

        for (const subscriber of subscribers) {
            if (!subscriber.expectResponse) continue;

            this.batch.push(async () => {
                const usernames = await this.telegramClient.getAdminUsernames(subscriber.id);
                await this.telegramClient.sendRandomMessage(subscriber.id, WARNING_MESSAGES);

                const mentions = usernames.length > 0 ? usernames.join(', ') : '@all';
                await this.telegramClient.sendMessage(subscriber.id, `${mentions} 🕊 Чат молчит... Я переживаю. Надеюсь, всё хорошо`);
            });
        }

        await this.batch.flush();
        console.log('🚨 Проверка безответных завершена');
    }
}

module.exports = PeriodicalTaskHandler;
