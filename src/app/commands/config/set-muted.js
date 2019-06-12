const { Command } = require('discord-akairo');

class SetMuteRole extends Command {
	constructor() {
		super('set-muted', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets the mute role of the guild.',
				usage: '<role>',
				examples: ['@Muted', 'Muted']
			},
			args: [
				{
					id: 'role',
					match: 'content',
					type: 'role'
				}
			]
		});
	}

	exec(message, { role }) {
		if (!role) return;
		this.client.settings.set(message.guild, 'muteRole', role.id);
		return message.util.reply(`set mute role to **${role.name}**`);
	}
}

module.exports = SetMuteRole;
