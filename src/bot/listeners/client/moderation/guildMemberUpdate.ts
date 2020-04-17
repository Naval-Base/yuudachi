import { Listener, PrefixSupplier } from 'discord-akairo';
import { GuildMember, Message, TextChannel } from 'discord.js';
import { ACTIONS, COLORS, MESSAGES, PRODUCTION, SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { Cases, CasesInsertInput, RoleStates, RoleStatesInsertInput } from '../../../util/graphQLTypes';

export default class GuildMemberUpdateModerationListener extends Listener {
	public constructor() {
		super('guildMemberUpdateModeration', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: 'client',
		});
	}

	public async exec(oldMember: GuildMember, newMember: GuildMember) {
		const moderation = this.client.settings.get(newMember.guild, SETTINGS.MODERATION);
		if (moderation) {
			if (this.client.caseHandler.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:MUTE`)) return;
			if (this.client.caseHandler.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:EMBED`)) return;
			if (this.client.caseHandler.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:EMOJI`)) return;
			if (this.client.caseHandler.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:REACTION`)) return;
			if (this.client.caseHandler.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:TAG`)) return;

			const modRole = this.client.settings.get(newMember.guild, SETTINGS.MOD_ROLE);
			if (modRole && newMember.roles.cache.has(modRole)) return;
			const muteRole = this.client.settings.get(newMember.guild, SETTINGS.MUTE_ROLE);
			const restrictRoles = this.client.settings.get(newMember.guild, SETTINGS.RESTRICT_ROLES);
			if (!muteRole || !restrictRoles) return;
			const { data } = await graphQLClient.query<any, RoleStatesInsertInput>({
				query: GRAPHQL.QUERY.ROLE_STATES,
				variables: {
					guild: newMember.guild.id,
					member: newMember.id,
				},
			});
			let automaticRoleState: RoleStates;
			if (PRODUCTION) automaticRoleState = data.roleStates[0];
			else automaticRoleState = data.roleStatesStaging[0];
			if (
				automaticRoleState?.roles.includes(muteRole) ||
				automaticRoleState?.roles.includes(restrictRoles.EMBED) ||
				automaticRoleState?.roles.includes(restrictRoles.EMOJI) ||
				automaticRoleState?.roles.includes(restrictRoles.REACTION) ||
				automaticRoleState?.roles.includes(restrictRoles.TAG)
			)
				return;
			const modLogChannel = this.client.settings.get(newMember.guild, SETTINGS.MOD_LOG);
			const role = newMember.roles.cache
				.filter((r) => r.id !== newMember.guild.id && !oldMember.roles.cache.has(r.id))
				.first();
			if (!role) {
				if (oldMember.roles.cache.has(muteRole) && !newMember.roles.cache.has(muteRole)) {
					const { data } = await graphQLClient.query<any, CasesInsertInput>({
						query: GRAPHQL.QUERY.MUTE_MEMBER,
						variables: {
							guild: newMember.guild.id,
							targetId: newMember.id,
							actionProcessed: false,
						},
					});
					let dbCase: Cases;
					if (PRODUCTION) dbCase = data.cases[0];
					else dbCase = data.casesStaging[0];
					if (dbCase) this.client.muteScheduler.cancel(dbCase);
				}
				return;
			}

			let actionName;
			let action: number;
			let processed = true;
			switch (role.id) {
				case muteRole:
					actionName = 'Mute';
					action = ACTIONS.MUTE;
					processed = false;
					break;
				case restrictRoles.EMBED:
					actionName = 'Embed restriction';
					action = ACTIONS.EMBED;
					try {
						if (newMember.guild.id === '222078108977594368') {
							(newMember.guild.channels.cache.get('222197033908436994') as TextChannel)?.send(newMember.toString(), {
								files: [MESSAGES.ACTIONS.EMBED.WOOSH],
							});
						}
					} catch {}
					break;
				case restrictRoles.EMOJI:
					actionName = 'Emoji restriction';
					action = ACTIONS.EMOJI;
					break;
				case restrictRoles.REACTION:
					actionName = 'Reaction restriction';
					action = ACTIONS.REACTION;
					break;
				case restrictRoles.TAG:
					actionName = 'Tag restriction';
					action = ACTIONS.TAG;
					break;
				default:
					return;
			}

			const totalCases = this.client.settings.get(newMember.guild, SETTINGS.CASES, 0) + 1;
			this.client.settings.set(newMember.guild, SETTINGS.CASES, totalCases);

			let modMessage;
			if (modLogChannel) {
				const prefix = (this.client.commandHandler.prefix as PrefixSupplier)({ guild: newMember.guild } as Message);
				const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
				const color = ACTIONS[action] as keyof typeof ACTIONS;
				const embed = (
					await this.client.caseHandler.log({
						member: newMember,
						action: actionName,
						caseNum: totalCases,
						reason,
						message: { author: null, guild: newMember.guild },
						nsfw: true,
					})
				).setColor(COLORS[color]);
				modMessage = await (this.client.channels.cache.get(modLogChannel) as TextChannel).send(embed);
			}

			await this.client.caseHandler.create({
				guild: newMember.guild.id,
				message: modMessage?.id,
				caseId: totalCases,
				targetId: newMember.id,
				targetTag: newMember.user.tag,
				action,
				actionProcessed: processed,
			});
		}
	}
}
