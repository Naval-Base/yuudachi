import { Listener } from 'discord-akairo';
import { EVENTS, TOPICS } from '../../util/logger';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client',
		});
	}

	public async exec() {
		this.client.logger.info(
			`Yawn... Hmph, ${this.client.user!.tag} (${this.client.user!.id}) is only with you because she's in a good mood!`,
			{ topic: TOPICS.DISCORD, event: EVENTS.READY },
		);
		this.client.user!.setActivity(`@${this.client.user!.username} help 💖`);
		this.client.promServer.listen(5500);
		this.client.node.on('message', this.client.nodeMessage);
		this.client.logger.info('Metrics listening on 5500', { topic: TOPICS.METRICS, event: EVENTS.READY });
		for (const guild of this.client.guilds.values()) {
			const logs = this.client.settings.get<string>(guild, 'guildLogs', undefined);
			if (!logs) continue;
			const webhook = (await guild.fetchWebhooks()).get(logs);
			if (!webhook) continue;
			this.client.webhooks.set(webhook.id, webhook);
		}
	}
}
