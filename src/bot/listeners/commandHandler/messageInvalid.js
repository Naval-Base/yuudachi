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
			if (!message.util.alias) return;
			const command = this.client.commandHandler.modules.get('tag-show');
			return this.client.commandHandler.runCommand(message, command, await command.parse(message, message.content.slice(1)));
		}
	}
}

module.exports = MessageInvalidListener;
