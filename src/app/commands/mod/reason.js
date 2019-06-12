const { Command, Argument } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const Case = require('../../models/cases');
const moment = require('moment');

class ReasonCommand extends Command {
	constructor() {
		super('reason', {
			aliases: ['reason'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: 'what case do you want to add a reason to?',
						retry: 'please enter a case number...'
					}
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string'
				}
			],
			description: {
				content: 'Sets/Updates the reason of a modlog entry.',
				usage: '<case> <...reason>',
				examples: ['1234 dumb', 'latest dumb']
			}
		});
	}

	async exec(message, { caseNum, reason }) {
		const total_case = this.client.settings.get(message.guild, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' ? total_case : caseNum;
		if (isNaN(caseToFind)) return message.reply('please provide a correct case number.');

		const db_case = await Case.findOne({ where: { case_id: caseToFind, guild: message.guild.id } });
		if (!db_case) {
			return message.reply('I couldn\'t find a case with that Id.');
		}
		if (db_case.mod_id && (db_case.mod_id !== message.author.id && !message.member.permissions.has('MANAGE_GUILD'))) {
			return message.reply('you can\'t set reason for this case.');
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		if (modLog && this.client.channels.has(modLog)) {
			const caseEmbed = await this.client.channels.get(modLog).messages.fetch(db_case.message);
			if (!caseEmbed) return message.reply('looks like the message doesn\'t exist anymore!');
			const embed = new MessageEmbed(caseEmbed.embeds[0]);
			embed.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.setDescription(caseEmbed.embeds[0].description.replace(/\*\*Reason:\*\* [\s\S]+/, `**Reason:** ${reason}`));
			await caseEmbed.edit({ embed });
		}

		await Case.update({
			mod_id: message.author.id,
			mod_tag: message.author.tag,
			reason,
			updatedAt: moment.utc().toDate()
		}, { where: { case_id: caseToFind, guild: message.guild.id } });

		return message.util.send(`Successfully set reason for case **#${caseToFind}**`);
	}
}

module.exports = ReasonCommand;
