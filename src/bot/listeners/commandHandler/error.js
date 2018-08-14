const { Listener } = require('discord-akairo');
const Raven = require('raven');

class CommandErrorListener extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	exec(error, message, command) {
		Raven.captureException(error);
	}
}

module.exports = CommandErrorListener;
