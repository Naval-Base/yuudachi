const { Command } = require('discord-akairo');

class ModLogCommand extends Command {
	constructor() {
		super('set-modlog', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets the mod-log, many of the commands use to log moderation actions.',
				usage: '<channel>',
				examples: ['#mod-log', 'mog-log']
			},
			args: [
				{
					id: 'channel',
					type: 'textChannel'
				}
			]
		});
	}

	exec(message, { channel }) {
		if (!channel) return;
		this.client.settings.set(message.guild, 'modLog', channel.id);
		return message.util.reply(`set moderation log channel to **${channel.name}**`);
	}
}

module.exports = ModLogCommand;
