const { Listener } = require('discord-akairo');

class ResumeListener extends Listener {
	constructor() {
		super('resumed', {
			emitter: 'client',
			event: 'resumed',
			category: 'client'
		});
	}

	exec(events) {
		this.client.logger.info(`Resumed, replayed ${events} events.`);
	}
}

module.exports = ResumeListener;
