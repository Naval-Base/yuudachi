import { Listener } from 'discord-akairo';

export default class ShardReconnectListener extends Listener {
	public constructor() {
		super('shardReconnecting', {
			emitter: 'client',
			event: 'shardReconnecting',
			category: 'client'
		});
	}

	public exec(id: number) {
		this.client.logger.info(`[SHARD ${id} RECONNECTING] Come at me if you don't value your life!`);
	}
}
