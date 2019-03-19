import { Listener } from 'discord-akairo';

export default class ShardReconnectListener extends Listener {
	public constructor() {
		super('shardReconnecting', {
			emitter: 'client',
			event: 'shardReconnecting',
			category: 'client'
		});
	}

	public exec() {
		this.client.logger.info("[SHARD RECONNECTING] Come at me if you don't value your life!");
	}
}
