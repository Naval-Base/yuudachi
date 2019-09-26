import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { ACTIONS, MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Cases } from '../../util/graphQLTypes';
const ms = require('@naval-base/ms'); // eslint-disable-line

export default class DurationCommand extends Command {
	public constructor() {
		super('duration', {
			aliases: ['duration'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.DURATION.DESCRIPTION,
				usage: '<case> <duration>',
				examples: ['1234 30m', 'latest 20h'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.DURATION.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.DURATION.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'duration',
					type: (_, str) => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.DURATION.PROMPT_2.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.DURATION.PROMPT_2.RETRY(message.author),
					},
				},
			],
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_ROLE, undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { caseNum, duration }: { caseNum: number | string; duration: number }) {
		const totalCases = this.client.settings.get<number>(message.guild!, SETTINGS.CASES, 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : (caseNum as number);
		if (isNaN(caseToFind)) return message.reply(MESSAGES.COMMANDS.MOD.DURATION.NO_CASE_NUMBER);
		const { data } = await graphQLClient.query({
			query: GRAPHQL.QUERY.MUTE_DURATION,
			variables: {
				guild: message.guild!.id,
				action: ACTIONS.MUTE,
				action_processed: false,
				case_id: caseToFind,
			},
		});
		let dbCase: Cases;
		if (PRODUCTION) dbCase = data.cases[0];
		else dbCase = data.staging_cases[0];
		if (!dbCase) {
			return message.reply(MESSAGES.COMMANDS.MOD.DURATION.NO_CASE);
		}
		if (dbCase.mod_id !== message.author!.id && !message.member!.permissions.has('MANAGE_GUILD')) {
			return message.reply(MESSAGES.COMMANDS.MOD.DURATION.WRONG_MOD);
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, SETTINGS.MOD_LOG, undefined);
		if (modLogChannel) {
			let caseEmbed;
			if (dbCase.message)
				caseEmbed = await (this.client.channels.get(modLogChannel) as TextChannel).messages.fetch(dbCase.message);
			if (!caseEmbed) return message.reply(MESSAGES.COMMANDS.MOD.DURATION.NO_MESSAGE);
			const embed = new MessageEmbed(caseEmbed.embeds[0]);
			if (dbCase.action_duration) {
				embed.setDescription(
					caseEmbed.embeds[0].description.replace(
						/\*\*Length:\*\* (.+)*/,
						`**Length:** ${ms(duration, { long: true })}`,
					),
				);
			} else {
				embed.setDescription(
					caseEmbed.embeds[0].description.replace(
						/(\*\*Action:\*\* Mute)/,
						`$1\n**Length:** ${ms(duration, { long: true })}`,
					),
				);
			}
			await caseEmbed.edit(embed);
		}
		const { data: res } = await graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.UPDATE_DURATION_MUTE,
			variables: {
				id: dbCase.id,
				action_duration: new Date(Date.now() + duration).toISOString(),
			},
		});
		if (PRODUCTION) dbCase = res.update_cases.returning[0];
		else dbCase = res.update_staging_cases.returning[0];
		this.client.muteScheduler.reschedule(dbCase);

		return message.util!.send(MESSAGES.COMMANDS.MOD.DURATION.REPLY(caseToFind));
	}
}
