import { Listener } from 'discord-akairo';
import { ACTIONS, PRODUCTION, SETTINGS, MESSAGES, COLORS, DATE_FORMAT_WITH_SECONDS } from '../../../util/constants';
import { GuildMember, TextChannel, MessageEmbed } from 'discord.js';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { Cases, CasesInsertInput } from '../../../util/graphQLTypes';
import * as moment from 'moment';
import { stripIndents } from 'common-tags';

export default class GuildMemberAddAntiraidListener extends Listener {
	public constructor() {
		super('guildMemberAddAntiraid', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const { guild, user } = member;
		if (!this.client.settings.get(guild, SETTINGS.MODERATION)) return;

		const mode = this.client.settings.get(guild, SETTINGS.ANTIRAID_MODE);
		const age = this.client.settings.get(guild, SETTINGS.ANTIRAID_AGE);
		if (!mode || !age) return;
		if (Date.now() - user.createdTimestamp >= age) return;

		// Manually constructing the case due to restrictions in Action constructor
		const key = `${guild.id}:${member.id}:${mode}`;

		// Action#before
		this.client.caseHandler.cachedCases.add(key);

		// Action#exec
		const totalCases = this.client.settings.get(guild, SETTINGS.CASES, 0) + 1;

		try {
			await member.send(MESSAGES.ACTIONS.ANTIRAID.MESSAGE(guild.name, mode === 'BAN' ? 'banned' : 'kicked'));
		} catch {}

		const reason = MESSAGES.ACTIONS.ANTIRAID.AUDIT(mode.toLowerCase(), totalCases);
		try {
			if (mode === 'BAN') {
				await guild.members.ban(member.id, { reason });
			} else {
				await member.kick(reason);
			}
		} catch (error) {
			this.client.logger.error(error.message);
			this.client.caseHandler.cachedCases.delete(key);
		}

		this.client.settings.set(guild, SETTINGS.CASES, totalCases);

		// Action#after
		await this.client.caseHandler.create({
			guild: guild.id,
			caseId: totalCases,
			targetId: member.id,
			targetTag: member.user.tag,
			modId: this.client.user?.id,
			modTag: this.client.user?.id,
			action: mode === 'BAN' ? ACTIONS.BAN : ACTIONS.KICK,
			reason: MESSAGES.ANTIRAID.REASON,
		});

		const modLogChannel = this.client.settings.get(guild, SETTINGS.MOD_LOG);
		if (modLogChannel) {
			const sinceCreationFormatted = moment.utc(member.user.createdAt ?? 0).fromNow();
			const creationFormatted = moment.utc(member.user.createdAt ?? 0).format(DATE_FORMAT_WITH_SECONDS);
			const sinceJoinFormatted = moment.utc(member.joinedAt ?? 0).fromNow();
			const joinFormatted = moment.utc().format(DATE_FORMAT_WITH_SECONDS);

			const { data } = await graphQLClient.query<any, CasesInsertInput>({
				query: GRAPHQL.QUERY.LOG_CASE,
				variables: {
					guild: guild.id,
					caseId: totalCases,
				},
			});

			let dbCase: Pick<Cases, 'id' | 'message'>;
			if (PRODUCTION) dbCase = data.cases[0];
			else dbCase = data.casesStaging[0];
			if (dbCase) {
				const embed = new MessageEmbed()
					.setColor(COLORS.ANTIRAID)
					.setAuthor(MESSAGES.ANTIRAID.REASON)
					.setDescription(
						stripIndents`
							**Member:** \`${member.user.tag}\` (${member.user.id})
							**Action:** ${mode.toLowerCase().replace(/(^|\s)\S/g, (t) => t.toUpperCase())}
							**Created:** \`${creationFormatted} (UTC)\` (${sinceCreationFormatted})
							**Joined:** \`${joinFormatted} (UTC)\` (${sinceJoinFormatted})
						`,
					)
					.setFooter(`Case ${totalCases}`)
					.setTimestamp(new Date());

				try {
					const modMessage = await (this.client.channels.cache.get(modLogChannel) as TextChannel).send(embed);
					await graphQLClient.mutate<any, CasesInsertInput>({
						mutation: GRAPHQL.MUTATION.LOG_CASE,
						variables: {
							id: dbCase.id,
							message: modMessage.id,
						},
					});
				} catch (error) {
					this.client.logger.error(error.message);
				}
			}
		}
	}
}
