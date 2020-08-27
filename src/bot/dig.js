const pify = require('pify');
const moment = require('moment');
const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

const config = require('../config');


function main(bot, targetX, targetY, targetZ) {
	if (targetX[0] > targetX[1]) targetX = (targetX[1], targetX[0]);
	if (targetY[0] > targetY[1]) targetY = (targetY[1], targetY[0]);
	if (targetZ[0] > targetZ[1]) targetZ = (targetZ[1], targetZ[0]);


	const log = (message) => {
		// bot.chat(message);
		console.log('<bot message>', message);
	};
	

	bot.on('chat', (username, message) => {
		const proc = {
			hello: () => {
				bot.chat('hello');
			},
			status: () => {
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


	bot.once('spawn', () => {
		const nextPosition = (x, z) => {
			let way = (x - targetX[0]) % 2 ? -1 : 1;
			if ((way == 1 && z == targetZ[1]) || (way == -1 && z == targetZ[0])) {
				x += 1;
			} else {
				z += way;
			}
			if (x > targetX[1]) return null;
			return { x: x, z: z };
		};

		const blockBlackList = ['air', 'vine'];

		const main = async () => {
			console.log('Hello, World!');
			console.log(targetX, targetY, targetZ);

			log('start!');

			let x = targetX[0];
			let z = targetZ[0];
			while (true) {
				bot.chat(`/tp ${x} ${targetY[1]} ${z}`);
				console.log('solve', x, z);

				for (let y = targetY[1]; y >= targetY[0]; y--) {
					let vec3 = new Vec3(x, y, z);
					let block = bot.blockAt(vec3);

					if (!block || blockBlackList.includes(block.name)) {
						continue;
					}

					bot.chat(`/tp ${x} ${block.position.y + 2} ${z}`);
					console.log(moment().format('HH:mm:ss'), block.position.x, block.position.y, block.position.z, block.name);
					await pify(bot.dig)(block);
				}

				let next = nextPosition(x, z);
				console.log('next', next);
				if (next) {
					x = next.x;
					z = next.z;
				} else {
					break;
				}
			}

			log('end!');
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
		log('spawn!');

		// bot.stopDigging(); cause bug ?
	});

	bot.once('spawn', function () {
		bot.chat(`/login ${config.bot.password}`);
	});

	main(bot, [68, 177], [63, 128], [-314, -193]);
}