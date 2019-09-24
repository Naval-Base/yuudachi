import { Listener } from 'discord-akairo';
import { MESSAGES } from '../../util/constants';
import { TOPICS } from '../../util/logger';

export default class ShardReconnectListener extends Listener {
	public constructor() {
		super('shardReconnecting', {
			emitter: 'client',
			event: 'shardReconnecting',
			category: 'client',
		});
	}

	public exec(id: number) {
		this.client.logger.info(MESSAGES.EVENTS.SHARD_RECONNECT.LOG, {
			topic: TOPICS.DISCORD,
			event: `SHARD ${id} RECONNECTING`,
		});
		this.client.promServer.close();
		this.client.logger.info(`Metrics server closed.`, { topic: TOPICS.METRICS, event: `SHARD ${id} RECONNECTING` });
	}
}
