const express = require('express');
const getHandlers = require('./bot');

module.exports = async () => {
    const handlers = await getHandlers();

    const app = express();
    const router = express.Router();

    app.use(express.json());
    app.use('/api/say-me-hello-today-bot', router);

    router.get('/hello', (req, res) => {
        console.log('👋 Hello endpoint вызван');
        res.send('Hello!');
    });

    router.post('/bot', async (req, res) => {
        await handlers.handleMessage(req.body);
        res.sendStatus(200);
    });

    router.post('/send-daily', async (req, res) => {
        await handlers.sendDailyQuestion();
        res.send('✅ Утренний вопрос разослан');
    });

    router.post('/send-alerts', async (req, res) => {
        await handlers.sendAlert();
        res.send('🚨 Проверка безответных завершена');
    });

    return app;
};
