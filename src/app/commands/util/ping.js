const { Command } = require('discord-akairo');

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping', 'pong'],
			category: 'util',
			description: {
				content: 'Pings me!'
			}
		});
	}

	async exec(message) {
		const msg = await message.util.send('Pinging~');
		const latency = (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp);
		return message.util.send([
			`Pong~ \`${latency.toString()} ms\` **::** \`${Math.round(this.client.ws.ping).toString()} ms\``
		]);
	}
}

module.exports = PingCommand;
