const moment=require('moment');
const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

const config = require('../config');


function main(bot, targetX, targetY, targetZ) {
	if (targetX[0] > targetX[1]) targetX = (targetX[1], targetX[0]);
	if (targetY[0] > targetY[1]) targetY = (targetY[1], targetY[0]);
	if (targetZ[0] > targetZ[1]) targetZ = (targetZ[1], targetZ[0]);


	bot.on('chat', function (username, message) {
		const proc = {
			hello: function () {
				bot.chat('hello');
			},
			status: function () {
				bot.chat(`Health: ${bot.health} Food: ${bot.food} Time: ${bot.time.time} Digging: ${bot.targetDigBlock ? true : false}`);
			}
		};

		if (message.startsWith('@digbot ')) {
			message = message.slice(8);
			console.log(username, message);
			if (Object.keys(proc).includes(message)) {
				proc[message]();
			}
		}
	});


	bot.once('spawn', function () {
		const nextPosition = function (x, z) {
			let way = (x - targetX[0]) % 2 ? -1 : 1;
			if (way == 1 && z == targetZ[1]) {
				if (x == targetX[1]) return null;
				return [x + 1, z];
			} else if (way == -1 && z == targetZ[0]) {
				if (x == targetX[1]) return null;
				return [x + 1, z];
			} else {
				return [x, z + way];
			}
		};

		const solve = function (x, z) {
			bot.chat(`/tp ${x} ${targetY[1]} ${z}`);
			console.log('solve', x, z);

			let blockList = [];
			for (let y = targetY[1]; y >= targetY[0]; y--) {
				let vec3 = new Vec3(x, y, z);
				let block = bot.blockAt(vec3);

				if (!block || block.name == 'air') {
					continue;
				}

				blockList.push(block);
			}

			function dig(id) {
				if (id < blockList.length) {
					let block = blockList[id];
					bot.chat(`/tp ${x} ${block.position.y + 2} ${z}`);
					if (block) {
						console.log(moment().format('HH:mm:ss'), block.position.x, block.position.y, block.position.z, block.name);
						bot.dig(block, () => dig(id + 1));
					}
				} else {
					let next = nextPosition(x, z);
					console.log('next', next);
					if (next) {
						solve(next[0], next[1]);
					} else {
						bot.chat('end!');
					}
				}
			}
			dig(0);
		};

		const main = function () {
			console.log('Hello, World!');
			console.log(targetX, targetY, targetZ);

			// bot.chat('start!');
			solve(targetX[0], targetZ[0]);
		};

		setTimeout(main, 500);
	});
}


if (require.main == module) {
	const bot = mineflayer.createBot({
		host: config.server.name,
		port: config.server.port,
		username: config.bot.username,
		version: false
	});

	bot.on('respawn', function () {
		// bot.chat('spawn!');

		// bot.stopDigging(); ?
	});
	
	bot.once('spawn', function () {
		bot.chat(`/login ${config.bot.password}`);
	});

	main(bot, [68, 177], [63, 128], [-314, -193]);
}