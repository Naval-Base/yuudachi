const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');

class ShardResumedListener extends Listener {
	constructor() {
		super('shardResumed', {
			event: 'shardResumed',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(id, replayedEvents) {
		Logger.info(`Shard ${id} resumed (replayed ${replayedEvents} events)`, { level: 'SHARD RESUMED' });
	}
}

module.exports = ShardResumedListener;
