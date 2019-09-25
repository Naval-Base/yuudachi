import { Listener } from 'discord-akairo';
import { MESSAGES } from '../../util/constants';
import { TOPICS } from '../../util/logger';

export default class ShardResumeListener extends Listener {
	public constructor() {
		super('shardResume', {
			emitter: 'client',
			event: 'shardResume',
			category: 'client',
		});
	}

	public exec(id: number) {
		this.client.logger.info(MESSAGES.EVENTS.SHARD_RESUME.LOG, {
			topic: TOPICS.DISCORD,
			event: `SHARD ${id} RESUME`,
		});
		this.client.promServer.listen(5500);
		this.client.logger.info(`Metrics listening on 5500`, { topic: TOPICS.METRICS, event: `SHARD ${id} RESUME` });
	}
}
