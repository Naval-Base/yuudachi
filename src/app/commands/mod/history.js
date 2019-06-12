const { Command, Argument } = require('discord-akairo');
const { historyEmbed } = require('../../util/utils');
const Case = require('../../models/cases');

class HistoryCommand extends Command {
	constructor() {
		super('history', {
			aliases: ['history'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'member',
					type: Argument.union('member', async (msg, id) => {
						const user = await this.client.users.fetch(id).catch(() => null);
						return user ? { id: user.id, user } : null;
					}),
					default: message => message.member
				}
			],
			description: {
				content: 'Check the history of a member.',
				usage: '<member>',
				examples: ['@Suvajit']
			}
		});
	}

	async exec(message, { member }) {
		const cases = await Case.findAll({ where: { target_id: member.id, guild: message.guild.id } });
		const embed = historyEmbed(member, cases);

		return message.util.send({ embed });
	}
}

module.exports = HistoryCommand;
