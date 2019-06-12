const { Listener } = require('discord-akairo');

class MessageInvalidListener extends Listener {
	constructor() {
		super('messageInvalid', {
			event: 'messageInvalid',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	async exec(message) {
		if (message.guild && message.util.parsed.prefix) {
			if (!message.util.parsed.alias || !message.util.parsed.afterPrefix) return;
			const command = this.client.commandHandler.modules.get('tag-show');
			return this.client.commandHandler.handleDirectCommand(message, message.util.parsed.afterPrefix, command, true);
		}
	}
}

module.exports = MessageInvalidListener;
