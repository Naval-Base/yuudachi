const { Command, Argument } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const ms = require('ms');

const ACTIONS = {
	1: 'Ban',
	2: 'Unban',
	3: 'Softban',
	4: 'Kick',
	5: 'Mute',
	6: 'Embed Restriction',
	7: 'Emoji Restriction',
	8: 'Reaction Restriction',
	9: 'Warn'
};

class CaseCommand extends Command {
	constructor() {
		super('case', {
			aliases: ['case'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: 'what case do you want to look up?',
						retry: 'please enter a case number...'
					}
				}
			],
			description: {
				content: 'Inspect a case, pulled from the database.',
				usage: '<case>',
				examples: ['1234']
			}
		});
	}

	async exec(message, { caseNum }) {
		const total_case = this.client.settings.get(message.guild, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' ? total_case : caseNum;
		if (isNaN(caseToFind)) return message.reply('at least provide me with a correct number.');
		const db = await Case.findOne({ where: { case_id: caseToFind, guild: message.guild.id } });
		if (!db) {
			return message.reply('I couldn\'t find a case with that Id!');
		}

		const moderator = await message.guild.members.fetch(db.mod_id).catch(() => false);
		const color = Object.keys(CONSTANTS.ACTIONS).find(key => CONSTANTS.ACTIONS[key] === db.action).split(' ')[0].toUpperCase();
		const embed = new MessageEmbed();
		if (db.mod_id !== null) {
			embed.setAuthor(`${db.mod_tag} (${db.mod_id})`, moderator ? moderator.user.displayAvatarURL() : null);
		}
		embed.setColor(CONSTANTS.COLORS[color]);
		embed.setDescription([
			`**Member:** ${db.target_tag} (${db.target_id})`,
			`**Action:** ${ACTIONS[db.action]}${db.action === 5 ? `\n**Length:** ${db.action_duration ? ms(db.action_duration - db.createdAt, { long: true }) : 'Not Set'}` : ''}`,
			`**Reason:** ${db.reason}${db.ref_id ? `\n**Ref case:** ${db.ref_id}` : ''}`
		]);
		embed.setFooter(`Case ${db.case_id}`);
		embed.setTimestamp(new Date(db.createdAt));

		return message.util.send({ embed });
	}
}

module.exports = CaseCommand;
