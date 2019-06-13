import { Listener } from 'discord-akairo';

export default class ShardReconnectListener extends Listener {
	public constructor() {
		super('shardReconnecting', {
			emitter: 'client',
			event: 'shardReconnecting',
			category: 'client'
		});
	}

	public exec(id: number): void {
		this.client.logger.info(`[SHARD ${id} RECONNECTING] Come at me if you don't value your life!`);
		this.client.promServer.close();
		this.client.node.removeListener('message', this.client.nodeMessage);
		this.client.logger.info(`[SHARD ${id} RECONNECTING][METRICS] Metrics server closed.`);
	}
}
