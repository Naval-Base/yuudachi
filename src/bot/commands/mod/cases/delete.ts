import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { ACTIONS, COLORS, MESSAGES, PRODUCTION, SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { Cases, CasesInsertInput } from '../../../util/graphQLTypes';
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

export default class CaseDeleteCommand extends Command {
	public constructor() {
		super('case-delete', {
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.CASES.DELETE.DESCRIPTION,
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
						start: (message: Message) => MESSAGES.COMMANDS.MOD.CASES.DELETE.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.CASES.DELETE.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'removeRole',
					match: 'flag',
					flag: ['--role'],
				},
			],
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE);
		if (!staffRole) return 'No mod role';
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { caseNum, removeRole }: { caseNum: number | string; removeRole: boolean }) {
		let totalCases = this.client.settings.get(message.guild!, SETTINGS.CASES, 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : (caseNum as number);
		if (isNaN(caseToFind)) return message.reply(MESSAGES.COMMANDS.MOD.CASES.DELETE.NO_CASE_NUMBER);
		const { data } = await graphQLClient.query<any, CasesInsertInput>({
			query: GRAPHQL.QUERY.CASES,
			variables: {
				guild: message.guild!.id,
				caseId: caseToFind,
			},
		});
		let dbCase: Omit<Cases, 'actionProcessed' | 'message'>;
		if (PRODUCTION) dbCase = data.cases[0];
		else dbCase = data.casesStaging[0];
		if (!dbCase) {
			return message.reply(MESSAGES.COMMANDS.MOD.CASES.DELETE.NO_CASE);
		}

		let moderator;
		try {
			moderator = await message.guild!.members.fetch(dbCase.modId!);
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
					dbCase.action === 5 && dbCase.actionDuration
						? `\n**Length:** ${ms(new Date(dbCase.actionDuration).getTime() - new Date(dbCase.createdAt).getTime(), {
								long: true,
						  })}`
						: ''
				}
				${dbCase.reason ? `**Reason:** ${dbCase.reason}` : ''}${dbCase.refId ? `\n**Ref case:** ${dbCase.refId}` : ''}
			`,
			)
			.setFooter(`Case ${dbCase.caseId}`)
			.setTimestamp(new Date(dbCase.createdAt));

		await message.channel.send(MESSAGES.COMMANDS.MOD.CASES.DELETE.DELETE, { embed });
		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
			max: 1,
			time: 10000,
		});

		if (!responses || responses.size !== 1) return message.reply(MESSAGES.COMMANDS.MOD.CASES.DELETE.TIMEOUT);
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			sentMessage = await message.channel.send(MESSAGES.COMMANDS.MOD.CASES.DELETE.DELETING(dbCase.caseId));
		} else {
			return message.reply(MESSAGES.COMMANDS.MOD.CASES.DELETE.CANCEL);
		}

		totalCases = this.client.settings.get(message.guild!, SETTINGS.CASES, 0) - 1;
		this.client.settings.set(message.guild!, SETTINGS.CASES, totalCases);

		await this.client.caseHandler.delete(message, caseToFind, removeRole);

		return sentMessage.edit(MESSAGES.COMMANDS.MOD.CASES.DELETE.REPLY(dbCase.caseId));
	}
}
