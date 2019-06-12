const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');
const { WebhookClient, MessageEmbed } = require('discord.js');

class RateLimitListener extends Listener {
	constructor() {
		super('rateLimit', {
			event: 'rateLimit',
			emitter: 'client',
			category: 'client'
		});
	}

	exec({ timeout, limit, method, path, route }) {
		const warn = { timeout, limit, method, path, route };

		const log = this.client.settings.get('global', 'clientLog', undefined);
		Logger.warn(log ? 'Ran into a rate limit.' : warn, { level: 'RATE LIMIT' });

		const webhook = new WebhookClient(log.id, log.token);
		if (!webhook) return;

		const embed = new MessageEmbed()
			.setColor(0xfaf5f5)
			.setAuthor('Rate Limit')
			.setTimestamp()
			.addField('Time Out', timeout, true)
			.addField('Limit', limit, true)
			.addField('HTTP Method', method, true)
			.addField('Route', route)
			.addField('Path', path);

		return webhook.send({
			username: 'Rate Limit',
			avatarURL: this.client.user.displayAvatarURL(),
			embeds: [embed]
		});
	}
}

module.exports = RateLimitListener;
