import { Listener } from 'discord-akairo';
import { MESSAGES } from '../../util/constants';
import { TOPICS } from '../../util/logger';

export default class ShardDisconnectListener extends Listener {
	public constructor() {
		super('shardDisconnected', {
			emitter: 'client',
			event: 'shardDisconnect',
			category: 'client',
		});
	}

	public exec(event: any, id: number) {
		this.client.logger.warn(MESSAGES.EVENTS.SHARD_DISCONNECT.LOG(event.code), {
			topic: TOPICS.DISCORD,
			event: `SHARD ${id} DISCONNECT`,
		});
		this.client.promServer.close();
		this.client.logger.info(`Metrics server closed.`, { topic: TOPICS.METRICS, event: `SHARD ${id} DISCONNECT` });
	}
}
