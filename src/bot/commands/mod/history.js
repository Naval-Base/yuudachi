const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

const ACTIONS = {
	1: 'ban',
	2: 'unban',
	3: 'kick',
	4: 'kick',
	5: 'mute',
	6: 'restriction',
	7: 'restriction',
	8: 'restriction',
	9: 'warn'
};

class HistoryCommand extends Command {
	constructor() {
		super('history', {
			aliases: ['history'],
			category: 'mod',
			description: {
				content: '.',
				usage: '<member>',
				examples: ['history @Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					'id': 'member',
					'match': 'content',
					'type': 'member',
					'default': message => message.member
				}
			]
		});
	}

	async exec(message, { member }) {
		if (!this.client.settings.get(message.guild, 'moderation', false)) {
			return message.reply('moderation commands are disabled on this server.');
		}
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		if (!staffRole && message.author.id !== member.id) return message.reply('you know, I know, we should just leave it at that.');

		const dbCases = await this.client.db.models.cases.findAll({ where: { target_id: member.id } });
		if (!dbCases.length) {
			return message.reply('I looked where I could, but I couldn\'t find a case with that Id, maybe look for something that actually exists next time!');
		}

		const footer = dbCases.reduce((count, c) => {
			const action = ACTIONS[c.action];
			count[action] = (count[action] || 0) + 1;
			return count;
		}, {});
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setFooter(`${footer.warn || 0} warnings, ${footer.restriction || 0} restrictions, ${footer.mute || 0} mutes, ${footer.kick || 0} kicks, and ${footer.ban || 0} bans.`);

		return message.util.send(embed);
	}
}

module.exports = HistoryCommand;
