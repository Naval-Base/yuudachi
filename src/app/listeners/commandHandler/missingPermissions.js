const { Listener } = require('discord-akairo');
const Logger = require('../../util/logger');

class MissingPermissionsListener extends Listener {
	constructor() {
		super('missingPermissions', {
			event: 'missingPermissions',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	exec(message, command, type, missing) {
		const text = {
			client: () => {
				const str = this.missingPermissions(message.channel, this.client.user, missing);
				return `I'm missing ${str} to use that command.`;
			},
			user: () => {
				const str = this.missingPermissions(message.channel, message.author, missing);
				return `You are missing ${str} to use that command.`;
			}
		}[type];

		const level = message.guild ? `${message.guild.name}/${message.author.tag}` : `${message.author.tag}`;
		Logger.log(`${command.id} ~ ${type}Permissions`, { level });

		if (!text) return;
		if (message.guild ? message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES') : true) {
			return message.reply(text());
		}
	}

	missingPermissions(channel, user, permissions) {
		const missingPerms = channel.permissionsFor(user).missing(permissions)
			.map(str => {
				if (str === 'VIEW_CHANNEL') return '`Read Messages`';
				if (str === 'SEND_TTS_MESSAGES') return '`Send TTS Messages`';
				if (str === 'USE_VAD') return '`Use VAD`';
				return `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``;
			});

		return missingPerms.length > 1
			? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}`
			: missingPerms[0];
	}
}

module.exports = MissingPermissionsListener;
