import { Listener } from 'discord-akairo';

export default class ShardResumedListener extends Listener {
	public constructor() {
		super('shardResumed', {
			emitter: 'client',
			event: 'shardResumed',
			category: 'client'
		});
	}

	public exec(id: number): void {
		this.client.logger.info(`[SHARD ${id} RESUMED] You made it out fine thanks to my luck! You ought to be thankful!`);
		this.client.promServer.listen(5500);
		this.client.node.on('message', this.client.nodeMessage);
		this.client.logger.info(`[SHARD ${id} RESUMED][METRICS] Metrics listening on 5500`);
	}
}
