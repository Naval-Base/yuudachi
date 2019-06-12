const { Command } = require('discord-akairo');

class SetMemberLogCommand extends Command {
	constructor() {
		super('set-memberlog', {
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Sets the member log channel of the guild.',
				usage: '<channel>',
				examples: ['#member-log', 'member-log']
			},
			args: [
				{
					id: 'channel',
					match: 'content',
					type: 'textChannel'
				}
			]
		});
	}

	exec(message, { channel }) {
		if (!channel) return;
		this.client.settings.set(message.guild, 'memberLog', channel.id);
		return message.util.reply(`set member log channel to **${channel.name}**`);
	}
}

module.exports = SetMemberLogCommand;
