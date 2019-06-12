const { Listener } = require('discord-akairo');
const RoleState = require('../../models/roleState');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class GuildMemberUpdateModerationListener extends Listener {
	constructor() {
		super('guildMemberUpdateModeration', {
			event: 'guildMemberUpdate',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(oldMember, newMember) {
		const moderation = this.client.settings.get(newMember.guild, 'moderation', undefined);
		if (moderation) {
			if (this.client.cached.delete(`CASE:${newMember.guild.id}:${newMember.id}:MUTE`)) return;
			if (this.client.cached.delete(`CASE:${newMember.guild.id}:${newMember.id}:EMBED`)) return;
			if (this.client.cached.delete(`CASE:${newMember.guild.id}:${newMember.id}:EMOJI`)) return;
			if (this.client.cached.delete(`CASE:${newMember.guild.id}:${newMember.id}:REACTION`)) return;

			const modRole = this.client.settings.get(newMember.guild, 'modRole', undefined);
			if (modRole && newMember.roles.has(modRole)) return;
			const muteRole = this.client.settings.get(newMember.guild, 'muteRole', undefined);
			const restrictRoles = this.client.settings.get(newMember.guild, 'restrictRoles', undefined);
			if (!muteRole && !restrictRoles) return;
			const roleState = await RoleState.findOne({
				where: { user: newMember.id, guild: newMember.guild.id }
			});
			if (roleState &&
                (roleState.roles.includes(muteRole) ||
				roleState.roles.includes(restrictRoles.embed) ||
				roleState.roles.includes(restrictRoles.emoji) ||
                roleState.roles.includes(restrictRoles.reaction))
			) return;
			const modLog = this.client.settings.get(newMember.guild, 'modLog', undefined);
			const role = newMember.roles.filter(r => r.id !== newMember.guild.id && !oldMember.roles.has(r.id)).first();

			if (!role) {
				if (oldMember.roles.has(muteRole) && !newMember.roles.has(muteRole)) {
					const mute = await Case.findOne({
						where: { target_id: newMember.id, guild: newMember.guild.id, action_processed: false }
					});
					if (mute) this.client.muteScheduler.cancelMute(mute);
				}
				return;
			}

			let actionName;
			let action;
			let processed = true;
			switch (role.id) {
				case muteRole:
					actionName = 'Mute';
					action = CONSTANTS.ACTIONS.MUTE;
					processed = false;
					break;
				case restrictRoles.embed:
					actionName = 'Embed Restriction';
					action = CONSTANTS.ACTIONS.EMBED;
					break;
				case restrictRoles.emoji:
					actionName = 'Emoji Restriction';
					action = CONSTANTS.ACTIONS.EMOJI;
					break;
				case restrictRoles.reaction:
					actionName = 'Reaction Restriction';
					action = CONSTANTS.ACTIONS.REACTION;
					break;
				default: return;
			}

			const totalCases = this.client.settings.get(newMember.guild, 'caseTotal', 0) + 1;
			this.client.settings.set(newMember.guild, 'caseTotal', totalCases);

			const prefix = this.client.commandHandler.prefix({ guild: newMember.guild });
			const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;

			let msg;
			if (modLog && this.client.channels.has(modLog)) {
				const color = Object.keys(CONSTANTS.ACTIONS).find(key => CONSTANTS.ACTIONS[key] === action).split(' ')[0].toUpperCase();
				const embed = logEmbed({ member: newMember, action: actionName, caseNum: totalCases, reason })
					.setColor(CONSTANTS.COLORS[color]);
				msg = await this.client.channels.get(modLog).send({ embed });
			}
			await Case.create({
				case_id: totalCases,
				target_id: newMember.id,
				target_tag: newMember.user.tag,
				guild: newMember.guild.id,
				action,
				reason,
				action_processed: processed,
				createdAt: moment.utc().toDate(),
				message: msg ? msg.id : null
			});
		}
	}
}

module.exports = GuildMemberUpdateModerationListener;
