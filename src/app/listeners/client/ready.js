const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			event: 'ready',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec() {
		Logger.info(`${this.client.user.tag} (${this.client.user.id})`, { level: 'READY' });
		this.client.muteScheduler.init();

		for (const guild of this.client.guilds.values()) {
			const log = this.client.settings.get(guild, 'guildLog', undefined);
			if (!log) continue;
			const webhook = (await guild.fetchWebhooks()).get(log);
			if (!webhook) continue;
			this.client.webhooks.set(webhook.id, webhook);
		}
	}
}

module.exports = ReadyListener;
