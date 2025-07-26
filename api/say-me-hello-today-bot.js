const getApp = require('../src/express');

module.exports = async (req, res) => {
    const app = await getApp();
    app(req, res)
};
