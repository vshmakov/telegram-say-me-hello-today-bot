const Subscriber = require('./Subscriber');
const {ANSWER_MESSAGES} = require("./messages");

class MessageHandler {
    constructor(repository, telegramClient) {
        this.repository = repository;
        this.telegramClient = telegramClient;
    }

    async handleMessage(message) {
        const text = (message.text || '').trim();
        const id = message.chat.id;

        if (!text) return;

        const commands = {
            '/start': this.handleStart.bind(this),
            '/off': this.handleOff.bind(this),
        };
        const commandHandler = commands[text];

        if (commandHandler) {
            return await commandHandler(id);
        }

        return await this.handleUserMessage(id);
    }

    async handleStart(id) {
        const added = await this.repository.add(new Subscriber(id, false));
        if (added) {
            await this.telegramClient.sendMessage(id, '👋 Привет! Я буду каждый день присылать тебе сообщение и ждать весточки 🙂');
        }
    }

    async handleOff(id) {
        const removed = await this.repository.remove(id);
        if (removed) {
            await this.telegramClient.sendMessage(id, '🌼 Хорошо, я больше не буду присылать утреннее приветствие. Береги себя! А я буду ждать твоего возвращения');
        }
    }

    async handleUserMessage(id) {
        const subscriber = await this.repository.get(id);
        if (!subscriber || !subscriber.expectResponse) return;

        subscriber.expectResponse = false;
        await this.repository.update(subscriber);
        console.log(`Ответ получен от ${id}`);

        await this.telegramClient.sendRandomMessage(id, ANSWER_MESSAGES);
    }
}

module.exports = MessageHandler;
