const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		});
	}

	exec() {
		this.client.logger.info(`Ready to set sail! Logged in as ${this.client.user.tag} (${this.client.user.id})`);
		this.client.user.setActivity(`@${this.client.user.username} help 💖`);
	}
}

module.exports = ReadyListener;
