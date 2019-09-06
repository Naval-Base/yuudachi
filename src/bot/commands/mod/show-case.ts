import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import Util, { ACTIONS, COLORS } from '../../util';
import { Case } from '../../models/Cases';
const ms = require('@naval-base/ms'); // eslint-disable-line

interface ActionKeys {
	[key: number]: string;
}

const ACTION_KEYS: ActionKeys = {
	1: 'Ban',
	2: 'Unban',
	3: 'Softban',
	4: 'Kick',
	5: 'Mute',
	6: 'Embed restriction',
	7: 'Emoji restriction',
	8: 'Reaction restriction',
	9: 'Warn'
};

export default class CaseCommand extends Command {
	public constructor() {
		super('case-show', {
			category: 'mod',
			description: {
				content: 'Inspect a case, pulled from the database.',
				usage: '<case>',
				examples: ['1234']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message) => `${message.author}, what case do you want to look up?`,
						retry: (message: Message) => `${message.author}, please enter a case number.`
					}
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { caseNum }: { caseNum: number | string }) {
		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : caseNum as number;
		if (isNaN(caseToFind)) return message.reply('at least provide me with a correct number.');
		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = await casesRepo.findOne({ guild: message.guild!.id, case_id: caseToFind });
		if (!dbCase) {
			return message.reply('I looked where I could, but I couldn\'t find a case with that Id, maybe look for something that actually exists next time!');
		}

		let moderator;
		try {
			moderator = await message.guild!.members.fetch(dbCase.mod_id);
		} catch {}
		const color = ACTIONS[dbCase.action] as keyof typeof ACTIONS;
		const embed = new MessageEmbed()
			.setAuthor(dbCase.mod_id ? `${dbCase.mod_tag} (${dbCase.mod_id})` : 'No moderator', dbCase.mod_id && moderator ? moderator.user.displayAvatarURL() : '')
			.setColor(COLORS[color])
			.setDescription(stripIndents`
				**Member:** ${dbCase.target_tag} (${dbCase.target_id})
				**Action:** ${ACTION_KEYS[dbCase.action]}${dbCase.action === 5 ? `\n**Length:** ${ms(dbCase.action_duration.getTime() - dbCase.createdAt.getTime(), { 'long': true })}` : ''}
				${dbCase.reason ? `**Reason:** ${dbCase.reason}` : ''}${dbCase.ref_id ? `\n**Ref case:** ${dbCase.ref_id}` : ''}
			`)
			.setFooter(`Case ${dbCase.case_id}`)
			.setTimestamp(new Date(dbCase.createdAt));

		return message.util!.send(embed);
	}
}
