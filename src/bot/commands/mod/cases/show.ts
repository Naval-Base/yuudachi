import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { ACTIONS, COLORS, MESSAGES, PRODUCTION, SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { Cases } from '../../../util/graphQLTypes';

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
	9: 'Warn',
};

export default class CaseCommand extends Command {
	public constructor() {
		super('case-show', {
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.CASES.SHOW.DESCRIPTION,
				usage: '<case>',
				examples: ['1234'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.CASES.SHOW.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.CASES.SHOW.PROMPT.RETRY(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { caseNum }: { caseNum: number | string }) {
		const guild = message.guild!;
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : (caseNum as number);
		if (isNaN(caseToFind)) return message.reply(MESSAGES.COMMANDS.MOD.CASES.SHOW.NO_CASE_NUMBER);
		const { data } = await graphQLClient.query<any, any>({
			query: GRAPHQL.QUERY.CASES,
			variables: {
				guild: guild.id,
				caseId: [caseToFind],
			},
		});
		let dbCase: Omit<Cases, 'actionProcessed' | 'message'>;
		if (PRODUCTION) dbCase = data.cases[0];
		else dbCase = data.casesStaging[0];
		if (!dbCase) {
			return message.reply(MESSAGES.COMMANDS.MOD.CASES.SHOW.NO_CASE);
		}

		let moderator;
		try {
			moderator = await guild.members.fetch(dbCase.modId ?? '');
		} catch {}
		const color = ACTIONS[dbCase.action] as keyof typeof ACTIONS;
		const embed = new MessageEmbed()
			.setAuthor(
				dbCase.modId ? `${dbCase.modTag} (${dbCase.modId})` : 'No moderator',
				dbCase.modId && moderator ? moderator.user.displayAvatarURL() : '',
			)
			.setColor(COLORS[color])
			.setDescription(
				stripIndents`
				**Member:** ${dbCase.targetTag} (${dbCase.targetId})
				**Action:** ${ACTION_KEYS[dbCase.action]}${
					dbCase.action === 5
						? `\n**Length:** ${ms(
								new Date(dbCase.actionDuration ?? 0).getTime() - new Date(dbCase.createdAt).getTime(),
								{
									long: true,
								},
						  )}`
						: ''
				}
				${dbCase.reason ? `**Reason:** ${dbCase.reason}` : ''}${dbCase.refId ? `\n**Ref case:** ${dbCase.refId}` : ''}
			`,
			)
			.setFooter(`Case ${dbCase.caseId}`)
			.setTimestamp(new Date(dbCase.createdAt));

		return message.util?.send(embed);
	}
}
