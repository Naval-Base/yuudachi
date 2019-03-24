import { Listener } from 'discord-akairo';

export default class ShardDisconnectListener extends Listener {
	public constructor() {
		super('shardDisconnected', {
			emitter: 'client',
			event: 'shardDisconnected',
			category: 'client'
		});
	}

	public exec(event: any, id: number) {
		this.client.logger.warn(`[SHARD ${id} DISCONNECTED] Hmm, I have to hide the fact I was defeated... I'll let you go this time! (${event.code})`);
		this.client.promServer.close();
		this.client.logger.info(`[SHARD ${id} DISCONNECTED][METRICS] Metrics server closed.`);
	}
}
