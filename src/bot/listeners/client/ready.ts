import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		});
	}

	public async exec(): Promise<void> {
		this.client.logger.info(`[READY] Yawn... Hmph, ${this.client.user!.tag} (${this.client.user!.id}) is only with you because she's in a good mood!`);
		this.client.user!.setActivity(`@${this.client.user!.username} help 💖`);
		this.client.promServer.listen(5500);
		this.client.node.on('message', this.client.nodeMessage);
		this.client.logger.info('[READY][METRICS] Metrics listening on 5500');
		for (const guild of this.client.guilds.values()) {
			const logs = this.client.settings.get(guild, 'guildLogs', undefined);
			if (!logs) continue;
			const webhook = (await guild.fetchWebhooks()).get(logs);
			if (!webhook) continue;
			this.client.webhooks.set(webhook.id, webhook);
		}
	}
}
