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
		this.client.logger.info(`Yawn… Hmph, ${this.client.user.tag} (${this.client.user.id}) is only with you because she's in a good mood!`);
		this.client.user.setActivity(`@${this.client.user.username} help 💖`);
	}
}

module.exports = ReadyListener;
