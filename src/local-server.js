require('dotenv').config();

const getApp = require('./express');
const PORT = process.env.LOCAL_SERVER_PORT || 3000;

async function run() {
    const app = await getApp();
    app.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });
}

run();
