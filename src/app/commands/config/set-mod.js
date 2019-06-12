const { Command } = require('discord-akairo');

class SetModRoleCommand extends Command {
	constructor() {
		super('set-mod', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets the mod role many of the commands use for permission checking.',
				usage: '<role>',
				examples: ['@Mod', 'Mods']
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
		this.client.settings.set(message.guild, 'modRole', role.id);
		return message.util.reply(`set moderation role to **${role.name}**`);
	}
}

module.exports = SetModRoleCommand;
