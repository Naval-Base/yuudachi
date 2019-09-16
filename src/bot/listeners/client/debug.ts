import { Listener } from 'discord-akairo';
import { EVENTS, TOPICS } from '../../util/logger';

export default class DebugListener extends Listener {
	public constructor() {
		super('debug', {
			emitter: 'client',
			event: 'debug',
			category: 'client',
		});
	}

	public exec(event: any) {
		this.client.logger.debug(event, { topic: TOPICS.DISCORD, event: EVENTS.DEBUG });
	}
}
