// afk.js
// Description: simple afk-bot
// Usage: node afk.js <username> <password>

const process = require('process');
const mineflayer = require('mineflayer');

const config = require('../config');
const username = process.argv[2];
const password = process.argv[3];

const bot = mineflayer.createBot({
	host: config.server_name,
	port: config.server_port,
	username: username,
	version: false
});
config.defaultRegister(bot);

bot.once('spawn', function () {
	bot.chat(`/login ${password}`);
	bot.chat('/home afk');
	bot.chat('afk bot login!');
});