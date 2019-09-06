import { Listener } from 'discord-akairo';
import { TOPICS } from '../../util/logger';

export default class ShardDisconnectListener extends Listener {
	public constructor() {
		super('shardDisconnected', {
			emitter: 'client',
			event: 'shardDisconnect',
			category: 'client'
		});
	}

	public exec(event: any, id: number) {
		this.client.logger.warn(`Hmm, I have to hide the fact I was defeated... I'll let you go this time! (${event.code})`, { topic: TOPICS.DISCORD, event: `SHARD ${id} DISCONNECT` });
		this.client.promServer.close();
		this.client.node.removeListener('message', this.client.nodeMessage);
		this.client.logger.info(`Metrics server closed.`, { topic: TOPICS.METRICS, event: `SHARD ${id} DISCONNECT` });
	}
}
