import { Listener } from 'discord-akairo';

export default class ShardResumedListener extends Listener {
	public constructor() {
		super('shardResumed', {
			emitter: 'client',
			event: 'shardResumed',
			category: 'client'
		});
	}

	public exec(events: number) {
		this.client.logger.info(`[SHARD RESUMED] You made it out fine thanks to my luck! You ought to be thankful! (replayed ${events} events)`);
	}
}
