import { Listener } from 'discord-akairo';
import { User } from 'discord.js';

export default class UserUpdateLewdcarioAvatarListener extends Listener {
	public constructor() {
		super('userUpdateLewdcarioAvatar', {
			emitter: 'client',
			event: 'userUpdate',
			category: 'client'
		});
	}

	public async exec(oldUser: User, newUser: User) {
		if (oldUser.id === '84484653687267328' && newUser.id === '84484653687267328') {
			if (oldUser.displayAvatarURL() !== newUser.displayAvatarURL()) {
				this.client.prometheus.lewdcarioAvatarCounter.inc();
			}
		}
	}
}
