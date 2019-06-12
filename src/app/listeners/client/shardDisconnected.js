const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');

class ShardDisconnectListener extends Listener {
	constructor() {
		super('shardDisconnected', {
			event: 'shardDisconnected',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(event, id) {
		Logger.warn(`Shard ${id} disconnected (${event.code})`, { level: 'SHARD DISCONNECTED' });
	}
}

module.exports = ShardDisconnectListener;
