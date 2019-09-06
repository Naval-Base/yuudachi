import { Listener, PrefixSupplier } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { RoleState } from '../../models/RoleStates';
import { Case } from '../../models/Cases';
import Util, { ACTIONS, COLORS } from '../../util';

export default class GuildMemberUpdateModerationListener extends Listener {
	public constructor() {
		super('guildMemberUpdateModeration', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: 'client'
		});
	}

	public async exec(oldMember: GuildMember, newMember: GuildMember) {
		const moderation = this.client.settings.get(newMember.guild, 'moderation', undefined);
		if (moderation) {
			if (this.client.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:MUTE`)) return;
			if (this.client.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:EMBED`)) return;
			if (this.client.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:EMOJI`)) return;
			if (this.client.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:REACTION`)) return;
			if (this.client.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:TAG`)) return;

			const modRole = this.client.settings.get<string>(newMember.guild, 'modRole', undefined);
			if (modRole && newMember.roles.has(modRole)) return;
			const muteRole = this.client.settings.get<string>(newMember.guild, 'muteRole', undefined);
			const restrictRoles = this.client.settings.get<{ embed: string; emoji: string; reaction: string; tag: string }>(newMember.guild, 'restrictRoles', undefined);
			if (!muteRole && !restrictRoles) return;
			const roleStatesRepo = this.client.db.getRepository(RoleState);
			const automaticRoleState = await roleStatesRepo.findOne({ user: newMember.id });
			if (
				automaticRoleState &&
				(automaticRoleState.roles.includes(muteRole) ||
				automaticRoleState.roles.includes(restrictRoles.embed) ||
				automaticRoleState.roles.includes(restrictRoles.emoji) ||
				automaticRoleState.roles.includes(restrictRoles.reaction) ||
				automaticRoleState.roles.includes(restrictRoles.tag))
			) return;
			const modLogChannel = this.client.settings.get<string>(newMember.guild, 'modLogChannel', undefined);
			const role = newMember.roles.filter(r => r.id !== newMember.guild.id && !oldMember.roles.has(r.id)).first();
			const casesRepo = this.client.db.getRepository(Case);
			if (!role) {
				if (oldMember.roles.has(muteRole) && !newMember.roles.has(muteRole)) {
					const dbCase = await casesRepo.findOne({ target_id: newMember.id, action_processed: false });
					if (dbCase) this.client.muteScheduler.cancelMute(dbCase);
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
				case restrictRoles.embed:
					actionName = 'Embed restriction';
					action = ACTIONS.EMBED;
					break;
				case restrictRoles.emoji:
					actionName = 'Emoji restriction';
					action = ACTIONS.EMOJI;
					break;
				case restrictRoles.reaction:
					actionName = 'Reaction restriction';
					action = ACTIONS.REACTION;
					break;
				case restrictRoles.tag:
					actionName = 'Tag restriction';
					action = ACTIONS.TAG;
					break;
				default:
					return;
			}

			const totalCases = this.client.settings.get<number>(newMember.guild, 'caseTotal', 0) + 1;
			this.client.settings.set(newMember.guild, 'caseTotal', totalCases);

			let modMessage;
			if (modLogChannel) {
				const prefix = (this.client.commandHandler.prefix as PrefixSupplier)({ guild: newMember.guild } as Message);
				const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
				const color = ACTIONS[action] as keyof typeof ACTIONS;
				const embed = (await Util.logEmbed({ member: newMember, action: actionName, caseNum: totalCases, reason })).setColor(COLORS[color]);
				modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
			}
			const dbCase = new Case();
			dbCase.guild = newMember.guild.id;
			if (modMessage) dbCase.message = modMessage.id;
			dbCase.case_id = totalCases;
			dbCase.target_id = newMember.id;
			dbCase.target_tag = newMember.user.tag;
			dbCase.action = action;
			dbCase.action_processed = processed;
			await casesRepo.save(dbCase);
		}
	}
}
