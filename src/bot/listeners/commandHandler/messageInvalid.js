const { Listener } = require('discord-akairo');

class MessageInvalidListener extends Listener {
	constructor() {
		super('messageInvalid', {
			emitter: 'commandHandler',
			event: 'messageInvalid',
			category: 'commandHandler'
		});
	}

	async exec(message) {
		if (message.util.prefix) {
			const command = this.client.commandHandler.modules.get('tag-show');
			return this.client.commandHandler.runCommand(message, command, await command.parse(message, message.content.slice(1)));
		}
		this.client.logger.info('Invalid message!');
	}
}

module.exports = MessageInvalidListener;
