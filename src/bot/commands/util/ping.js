const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

const RESPONSES = [
	'No.',
	'Not happening.',
	'Maybe later.',
	stripIndents`:ping_pong: Pong! \`$(ping)ms\`
		Heartbeat: \`$(heartbeat)ms\``,
	stripIndents`I-it's not like I wanted to pong! \`$(ping)ms\`
		Doki doki: \`$(heartbeat)ms\``,
	stripIndents`D-don't think this means anything special! \`$(ping)ms\`
		Heartbeat: \`$(heartbeat)ms\``,
	stripIndents`D-don't think this means anything special! \`$(ping)ms\`
		Heartbeat: \`$(heartbeat)ms\``
];

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			description: {
				content: "Checks the bot's ping to the Discord server."
			},
			category: 'util',
			ratelimit: 2
		});
	}

	async exec(message) {
		const msg = await message.util.send('Pinging...');

		return message.util.send(
			RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
				.replace('$(ping)', Math.round(msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp))
				.replace('$(heartbeat)', Math.round(this.client.ping))
		);
	}
}

module.exports = PingCommand;
