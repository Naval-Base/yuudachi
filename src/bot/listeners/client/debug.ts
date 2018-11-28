import { Listener } from 'discord-akairo';

export default class DebugListener extends Listener {
	public constructor() {
		super('debug', {
			emitter: 'client',
			event: 'debug',
			category: 'client'
		});
	}

	public exec(event: any) {
		this.client.logger.debug(`[DEBUG] ${event}`);
	}
}
