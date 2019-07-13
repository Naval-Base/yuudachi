import { Listener } from 'discord-akairo';

export default class ShardDisconnectListener extends Listener {
	public constructor() {
		super('shardDisconnected', {
			emitter: 'client',
			event: 'shardDisconnected',
			category: 'client'
		});
	}

	public exec(event: any, id: number): void {
		this.client.logger.warn(`Hmm, I have to hide the fact I was defeated... I'll let you go this time! (${event.code})`, { topic: 'DISCORD', event: `SHARD ${id} DISCONNECTED` });
		this.client.promServer.close();
		this.client.node.removeListener('message', this.client.nodeMessage);
		this.client.logger.info(`Metrics server closed.`, { topic: 'METRICS', event: `SHARD ${id} DISCONNECTED` });
	}
}
