const { Inhibitor } = require('discord-akairo');

class ModerationInhibitor extends Inhibitor {
	constructor() {
		super('moderation', {
			reason: 'moderation'
		});
	}

	exec(message, command) {
		if (command.categoryID !== 'mod') return false;
		if (!this.client.settings.get(message.guild, 'moderation', undefined)) {
			return true;
		}
		return false;
	}
}

module.exports = ModerationInhibitor;
