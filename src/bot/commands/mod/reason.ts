import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Cases, CasesInsertInput } from '../../util/graphQLTypes';

export default class ReasonCommand extends Command {
	public constructor() {
		super('reason', {
			aliases: ['reason'],
			category: 'mod',
			description: {
				content: MESSAGES.COMMANDS.MOD.REASON.DESCRIPTION,
				usage: '<case> [--ref=number] <...reason>',
				examples: ['1234 dumb', 'latest dumb', 'latest --ref=1234 cool'],
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_ROLES],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: 'string',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.REASON.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.MOD.REASON.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'ref',
					type: 'integer',
					match: 'option',
					flag: ['--ref=', '-r='],
				},
				{
					id: 'nsfw',
					match: 'flag',
					flag: ['--nsfw'],
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
				},
			],
		});
	}

	public async exec(
		message: Message,
		{ caseNum, ref, nsfw, reason }: { caseNum: string; ref: number; nsfw: boolean; reason: string },
	) {
		const guild = message.guild!;
		let caseToFind: number[];
		if (/\d+-\d+/.test(caseNum)) {
			const [, from, to] = /(\d+)-(\d+)/.exec(caseNum)!;
			caseToFind = Array.from({ length: parseInt(to, 10) + 1 - parseInt(from, 10) }, (_, i) => i + parseInt(from, 10));
		} else {
			const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0);
			caseToFind = caseNum === 'latest' || caseNum === 'l' ? [totalCases] : [parseInt(caseNum, 10)];
			if (isNaN(caseToFind[0])) return message.reply(MESSAGES.COMMANDS.MOD.REASON.NO_CASE_NUMBER);
		}
		const { data } = await graphQLClient.query<any, any>({
			query: GRAPHQL.QUERY.CASES,
			variables: {
				guild: guild.id,
				caseId: caseToFind,
			},
		});
		let dbCases: Cases[];
		if (PRODUCTION) dbCases = data.cases;
		else dbCases = data.casesStaging;
		if (!dbCases.length) {
			return message.reply(MESSAGES.COMMANDS.MOD.REASON.NO_CASE);
		}
		let statusMessage;
		if (dbCases.length >= 10) {
			await message.util?.send(`${dbCases.length} cases will be changed; proceed?`);

			const responses = await message.channel.awaitMessages((msg: Message) => msg.author.id === message.author.id, {
				max: 1,
				time: 10000,
			});

			if (responses?.size !== 1) {
				message.reply('Setting reasons cancelled.');
				return null;
			}
			const response = responses.first();

			if (/^y(?:e(?:a|s)?)?$/i.test(response?.content ?? '')) {
				statusMessage = await response?.reply('Setting reasons...');
			} else {
				message.reply('Setting reasons cancelled.');
				return null;
			}
		}

		for (const dbCase of dbCases) {
			if (
				dbCase.modId &&
				dbCase.modId !== message.author.id &&
				!message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
			) {
				return message.reply(MESSAGES.COMMANDS.MOD.REASON.WRONG_MOD);
			}

			const modLogChannel = this.client.settings.get(guild, SETTINGS.MOD_LOG);
			if (modLogChannel) {
				const caseEmbed = await (this.client.channels.cache.get(modLogChannel) as TextChannel).messages.fetch(
					dbCase.message ?? '',
				);
				if (!caseEmbed) return message.reply(MESSAGES.COMMANDS.MOD.REASON.NO_MESSAGE);
				const embed = new MessageEmbed(caseEmbed.embeds[0]).setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL(),
				);
				if (reason) {
					embed.setDescription(
						caseEmbed.embeds[0].description.replace(/\*\*Reason:\*\* [\s\S]+/, `**Reason:** ${reason}`),
					);
				}
				if (nsfw) {
					embed.setThumbnail('');
				}
				if (ref) {
					let reference;
					try {
						const { data: res } = await graphQLClient.query<any, CasesInsertInput>({
							query: GRAPHQL.QUERY.CASES,
							variables: {
								guild: guild.id,
								caseId: ref,
							},
						});
						if (PRODUCTION) reference = res.cases[0];
						else reference = res.casesStaging[0];
					} catch (error) {
						reference = null;
					}
					if (reference) {
						if (/\*\*Ref case:\*\* [\s\S]+/.test(embed.description)) {
							embed.setDescription(
								embed.description.replace(
									/\*\*Ref case:\*\* [\s\S]+/,
									`**Ref case:** [${reference.caseId}](https://discordapp.com/channels/${reference.guild}/${modLogChannel}/${reference.message})`,
								),
							);
						} else {
							embed.setDescription(
								`${embed.description}\n**Ref case:** [${reference.caseId}](https://discordapp.com/channels/${reference.guild}/${modLogChannel}/${reference.message})`,
							);
						}
					}
				}
				await caseEmbed.edit(embed);
			}

			await graphQLClient.mutate<any, CasesInsertInput>({
				mutation: GRAPHQL.MUTATION.UPDATE_REASON,
				variables: {
					id: dbCase.id,
					modId: message.author.id,
					modTag: message.author.tag,
					reason: reason || dbCase.reason,
				},
			});
		}

		if (statusMessage) {
			return statusMessage.edit(MESSAGES.COMMANDS.MOD.REASON.REPLY(caseToFind));
		}
		return message.util?.send(MESSAGES.COMMANDS.MOD.REASON.REPLY(caseToFind));
	}
}
