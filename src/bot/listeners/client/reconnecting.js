const { Listener } = require('discord-akairo');

class ReconnectListener extends Listener {
	constructor() {
		super('reconnecting', {
			emitter: 'client',
			event: 'reconnecting',
			category: 'client'
		});
	}

	exec() {
		this.client.logger.info('Reconnecting...');
	}
}

module.exports = ReconnectListener;
