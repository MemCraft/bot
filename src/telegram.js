const mineflayer = require('mineflayer');
const TelegramBot = require('node-telegram-bot-api');

const config = require('./config');



function registerChatBot(mcbot = null, tgbot = null) {
	if (!mcbot) {
		mcbot = mineflayer.createBot({
			host: config.server.name,
			port: config.server.port,
			username: config.telegram.chatbot.username,
			version: false,
		});

		mcbot.once('spawn', function () {
			mcbot.chat(`/login ${config.telegram.chatbot.password}`);
			mcbot.chat(`/gamemode spectator`);
			mcbot.chat('[chatbot] successfully login!');
		});

		mcbot.forward_chat = function (message) {
			mcbot.chat(`/tellraw @a "${message}"`);
		}
	}


	if (!tgbot) {
		tgbot = new TelegramBot(config.telegram.token, { polling: true });

		tgbot.forward_chat = function (message) {
			tgbot.sendMessage(config.telegram.chatId, message);
		}
	}


	mcbot.on('chat', function (username, message) {
		const ingoreList = [
			'online',
			'Server',
			'Console',
			config.telegram.chatbot.username,
		];

		if (ingoreList.includes(username)) {
			return;
		}
		
		console.log(`<${username}> ${message}`);
		tgbot.forward_chat(`<${username}> ${message}`);
	})


	tgbot.on('message', (msg) => {
		const chatId = msg.chat.id;
		const username = msg.from.username;
		const message = msg.text;

		if (chatId != config.telegram.chatId) {
			return;
		}

		console.log(`{${username}} ${message}`);
		mcbot.forward_chat(`{${username}} ${message}`);
	});

};



if (require.main == module) {
	registerChatBot();
}

module.exports = registerChatBot;