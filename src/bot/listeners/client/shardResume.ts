import { Listener } from 'discord-akairo';
import { TOPICS } from '../../util/logger';

export default class ShardResumeListener extends Listener {
	public constructor() {
		super('shardResume', {
			emitter: 'client',
			event: 'shardResume',
			category: 'client'
		});
	}

	public exec(id: number) {
		this.client.logger.info(`You made it out fine thanks to my luck! You ought to be thankful!`, { topic: TOPICS.DISCORD, event: `SHARD ${id} RESUME` });
		this.client.promServer.listen(5500);
		this.client.node.on('message', this.client.nodeMessage);
		this.client.logger.info(`Metrics listening on 5500`, { topic: TOPICS.METRICS, event: `SHARD ${id} RESUME` });
	}
}
