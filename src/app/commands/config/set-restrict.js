const { Command } = require('discord-akairo');

class SetRestrictRolesCommand extends Command {
	constructor() {
		super('set-restrict', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets the restriction roles of the guild.',
				usage: '<embedrole> <emojirole> <reactionrole>',
				examples: ['@Embed @Emoji @Reaction']
			},
			args: [
				{
					id: 'embed',
					type: 'role',
					prompt: {
						start: 'what role should act as the embed restricted role?',
						retry: 'please mention a proper role to be the embed restricted role.'
					}
				},
				{
					id: 'emoji',
					type: 'role',
					prompt: {
						start: 'what role should act as the emoji restricted role?',
						retry: 'please mention a proper role to be the emoji restricted role.'
					}
				},
				{
					id: 'reaction',
					type: 'role',
					prompt: {
						start: 'what role should act as the reaction restricted role?',
						retry: 'please mention a proper role to be the reaction restricted role.'
					}
				}
			]
		});
	}

	exec(message, { embed, emoji, reaction }) {
		const roles = { embed: embed.id, emoji: emoji.id, reaction: reaction.id };
		this.client.settings.set(message.guild, 'restrictRoles', roles);
		return message.util.reply(`set restricted roles to **${embed.name}**, **${emoji.name}** and **${reaction.name}**`);
	}
}

module.exports = SetRestrictRolesCommand;
