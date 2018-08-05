const { Listener } = require('discord-akairo');

class DisconnectListener extends Listener {
	constructor() {
		super('disconnect', {
			emitter: 'client',
			event: 'disconnect',
			category: 'client'
		});
	}

	exec(event) {
		this.client.logger.warn(`Disconnected with code: ${event.code}`);
	}
}

module.exports = DisconnectListener;
