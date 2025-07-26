require('dotenv').config({path: '.env.test'});
const fetch = require('node-fetch');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3025/api/say-me-hello-today-bot';
const CHAT_ID = process.env.TEST_CHAT_ID;

async function sendMessage(text) {
    const response = await fetch(`${BASE_URL}/bot`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            message: {
                chat: {id: CHAT_ID},
                text,
            },
        }),
    });

    expect(response.status).toBe(200);
    return response;
}

async function sendDaily() {
    const res = await fetch(`${BASE_URL}/send-daily`, {method: 'POST'});
    expect(res.status).toBe(200);
    return res;
}

async function sendAlerts() {
    const res = await fetch(`${BASE_URL}/send-alerts`, {method: 'POST'});
    expect(res.status).toBe(200);
    return res;
}

function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

describe('Telegram Bot E2E Flow', () => {
    it('handles full interaction flow with response', async () => {
        await sendMessage('/start');
        await sendDaily();
        await sendMessage('Доброе утро!');
        await sendMessage('/off');
        await sleep(2000);
    });

    it('handles alert flow when no response is received', async () => {
        await sendMessage('/start');
        await sendDaily();
        await sendAlerts();
        await sendMessage('/off');
    });
});
