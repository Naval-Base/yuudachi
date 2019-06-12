const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');

class ShardReconnectListener extends Listener {
	constructor() {
		super('shardReconnecting', {
			event: 'shardReconnecting',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(id) {
		Logger.info(`Shard ${id} Reconnecting`, { level: 'SHARD RECONNECTING' });
	}
}

module.exports = ShardReconnectListener;
