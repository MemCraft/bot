const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

let text = fs.readFileSync(path.join(__dirname, '../config.yml')).toString();
module.exports = {
	...yaml.parse(text),

	defaultRegister: function (bot) {
		bot.on('chat', function (username, message) {
			console.log('[chat]', `<${username}> ${message}`);
		});

		bot.on('kicked', function (reason, loggedIn) {
			console.log('[kicked]', reason, loggedIn);
		});

		bot.on('error', function (err) {
			console.log('[error]', err);
		});
	},

};