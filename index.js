require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');
const bot = new TelegramBot(TOKEN, { polling: true });

// Загружаем подписчиков как объект { chatId: boolean }
function loadSubscribers() {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'));
    } catch {
        return {};
    }
}

function saveSubscribers(subscribers) {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

function addSubscriber(chatId) {
    const subscribers = loadSubscribers();

    if (chatId in subscribers) {
        return false;
    }

    subscribers[chatId] = true;
    saveSubscribers(subscribers);
    console.log(`Новый подписчик: ${chatId}`);

    return true;
}

function removeSubscriber(chatId) {
    const subscribers = loadSubscribers();

    if (!(chatId in subscribers)) {
        return false;
    }

    delete subscribers[chatId];
    saveSubscribers(subscribers);
    console.log(`Подписчик ${chatId} удалён`);

    return true;
}

async function sendRandomMessage(chatId, messages) {
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];
    await bot.sendMessage(chatId, message);
}

// Рассылка вопроса — сбрасывает флаги на false
function sendDailyQuestion() {
    const subscribers = loadSubscribers();
    const messages = [
        "Доброе утро! Как ты себя сегодня чувствуешь? 💬",
        "Салют! Как ты сегодня? ☕️",
        "Доброго тебе утра! Как настроение? 😊",
        "Привет! Вот и настал новый день. Что подсказывает тебе его утро? 🌅",
        "Доброе утро! Ну что, как у тебя дела, всё ли в порядке? 💛",
        "Приветствую! Как самочувствие сегодня? 🌤",
        "Доброе утро! Хочу убедиться — всё ли хорошо у тебя? 🙏",
        "Привет! Скажи, как проходит твоё утро? ☀️",
        "Приветствую тебя! Есть ли силы и настроение на день? 💪",
        "Доброго дня! Ты сегодня в порядке? 💭",
        "Привет! Проверка связи — как ты там, добрый человек? 😏",
        "Привет-привет! Ты уже успела натворить что-нибудь хорошее сегодня? 😉",
        "С добрым утром! Как дела у тебя? 📬",
        "Доброе утро! А ты уже проснулась? Что сегодня — завтрак, зарядка или «ещё пять минуточек»? ☕️🛌",
        "Привет! Говорят, день начинается с улыбки... Проверим это прямо сейчас? 😁",
        "Стук-стук, это я. Волнуюсь — как там мой дорогой собеседник? 🤖💌",
        "Доброе утро, мой друг! Пусть этот день принесёт тебе тепло и ясность. Как ты сегодня? 🌞",
        "Привет! Новое утро — новый шанс почувствовать себя хорошо. Как настроение? 🌼",
        "С началом дня! Заглянул узнать, как ты поживаешь. Всё ли спокойно на душе? 💫",
        "Доброго утра! Я тут подумал — а не узнать ли мне, как ты себя чувствуешь? 🙂",
        "Солнечного тебе утра! Надеюсь, проснулась в хорошем настроении. Поделишься? 🌻",
        "Приветик! Утро — время надежд. Что у тебя на сердце сегодня? 💛",
        "Доброе утро! Всё вокруг просыпается — как ты встречаешь этот день? ☀️",
    ];

    for (const chatId of Object.keys(subscribers)) {
        sendRandomMessage(chatId, messages);
        subscribers[chatId] = false;
    }

    saveSubscribers(subscribers);
    console.log('✅ Утренний опрос отправлен');
}

async function getAdminUsernames(chatId) {
    try {
        const admins = await bot.getChatAdministrators(chatId);

        return admins
            .map(admin => admin.user.username)
            .filter(Boolean)
            .map(username => `@${username}`);
    } catch (error) {
        console.error('Ошибка при получении администраторов:', error);
        return [];
    }
}

// Проверка через 12 часов — где false, тревожим
async function sendAlerts() {
    const subscribers = loadSubscribers();

    for (const [chatId, responded] of Object.entries(subscribers)) {
        if (responded) {
            continue;
        }

        const usernames = await getAdminUsernames(chatId);

        const messages = [
            "💌 Я очень жду весточку от тебя. Отзовись, пожалуйста!",
            "🕊 Тишина настораживает... Напиши хоть слово, пожалуйста.",
            "💭 Я волнуюсь. Как ты? Жду твоего ответа.",
            "📮 Сообщение не получено. Надеюсь, у тебя всё хорошо. Жду отклика.",
            "🧡 Ты мне не ответил. Я беспокоюсь. Дай знать, что у тебя всё в порядке.",
            "📩 Каждый день я надеюсь на весточку от тебя. Отзовись, пожалуйста.",
            "💬 Я всё ещё жду твоего ответа. Мне важно знать, как ты.",
            "🌥 День прошёл без вестей. Очень хочется услышать тебя.",
            "🤖 Твой бот волнуется. Напиши, как ты себя чувствуешь.",
            "💓 Сердце не на месте без твоих слов. Отзовись.",
            "📫 Сообщение не получено. Просто скажи, как ты — я жду.",
            "🦉 Эй, как ты там? В этом чате тишина, и я переживаю.",
            "📢 Привет! Жду твоего ответа с самого утра. Напиши пару слов.",
            "💌 Ты не ответил, и мне неспокойно. Пожалуйста, отзовись.",
            "🧸 Я рядом и на связи. Дай знать, что у тебя всё хорошо."
        ];

        await sendRandomMessage(chatId, messages);
        const mentions = usernames.length > 0
            ? usernames.join(', ')
            : '@all';
        await bot.sendMessage(chatId, `${mentions} 🕊 Чат молчит... Я переживаю. Надеюсь, всё хорошо`);
    }

    console.log('🚨 Проверка безответных завершена');
}

// Обработка команд
bot.onText(/\/start/, (msg) => {
    if (addSubscriber(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, '👋 Привет! Я буду каждый день присылать тебе сообщение и ждать весточки 🙂');
    }
});

bot.onText(/\/off/, (msg) => {
    if (removeSubscriber(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, '🌼 Хорошо, я больше не буду присылать утреннее приветствие. Береги себя! А я буду ждать твоего возвращения');
    }
});

// Обработка любого сообщения
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const subscribers = loadSubscribers();

    if (!(chatId in subscribers && !subscribers[chatId])) {
        return;
    }

    subscribers[chatId] = true;
    saveSubscribers(subscribers);
    console.log(`Ответ получен от ${chatId}`);

    const messages = [
        "Рад, что у тебя всё хорошо! 😊",
        "Отличные новости, так держать! 💪",
        "Ура! Пусть так будет весь день! 🌞",
        "Приятно слышать, пусть день будет лёгким! 🍃",
        "Класс! Пусть сегодня всё будет по-твоему! 🌈",
        "Здорово! А я тут тихо радуюсь за тебя 🤖💚",
        "Отлично! Продолжай в том же духе! 🚀",
        "Вот это настрой! Так держать! 🔥",
        "Хорошо — это уже почти прекрасно 😉",
        "Приятно слышать, что ты в порядке. Береги это состояние 🙏",
        "Вот это радует! Пусть день несёт тебе только хорошее ☀️",
        "Приятно знать, что у тебя всё в порядке 😌",
        "Замечательно! Не забывай улыбаться — даже просто так 😄",
        "Это прекрасно! Делай себе сегодня маленькие радости 🍫",
        "Класс! С таким настроением тебе всё по плечу 💼🎯",
        "Ты молодец! Можешь похлопать себя по спине 👏🙂",
    ];

    sendRandomMessage(chatId, messages);
});

const questionHour = 6;

// Утреннее сообщение
cron.schedule(`0 ${questionHour} * * *`, sendDailyQuestion, { timezone: 'Europe/Moscow' });

// Проверка через 12 часов
cron.schedule(`0 ${questionHour + 12} * * *`, sendAlerts, { timezone: 'Europe/Moscow' });
