const { Listener } = require('discord-akairo');

class MessageInvalidListener extends Listener {
	constructor() {
		super('messageInvalid', {
			emitter: 'commandHandler',
			event: 'messageInvalid',
			category: 'commandHandler'
		});
	}

	exec(message) {
		if (message.util.prefix) {
			const command = this.client.commandHandler.modules.get('tag-show');
			return this.client.commandHandler.runCommand(message, command, { name: message.util.alias });
		}
		this.client.logger.info('Invalid message!');
	}
}

module.exports = MessageInvalidListener;
