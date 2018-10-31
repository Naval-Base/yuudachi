const { Listener } = require('discord-akairo');
const { CONSTANTS: { ACTIONS, COLORS }, logEmbed } = require('../../util');

class GuildMemberUpdateListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: 'client'
		});
	}

	async exec(oldMember, newMember) {
		const roleState = this.client.settings.get(newMember.guild, 'roleState');
		const moderation = this.client.settings.get(newMember.guild, 'moderation');
		if (roleState) {
			await newMember.guild.members.fetch(newMember.id);
			if (newMember.roles) {
				const roles = newMember.roles.filter(role => role.id !== newMember.guild.id).map(role => role.id);
				if (roles.length) {
					await this.client.db.models.role_states.upsert({ guild: newMember.guild.id, user: newMember.id, roles });
				} else {
					await this.client.db.models.role_states.destroy({ where: { guild: newMember.guild.id, user: newMember.id } });
				}
			}
		}
		if (moderation) {
			if (this.client._cachedCases.delete(`${newMember.guild.id}:${newMember.id}:MUTE`)) return;
			if (this.client._cachedCases.delete(`${newMember.guild.id}:${newMember.id}:EMBED`)) return;
			if (this.client._cachedCases.delete(`${newMember.guild.id}:${newMember.id}:EMOJI`)) return;
			if (this.client._cachedCases.delete(`${newMember.guild.id}:${newMember.id}:REACTION`)) return;

			const muteRole = this.client.settings.get(newMember.guild, 'muteRole');
			const restrictRoles = this.client.settings.get(newMember.guild, 'restrictRoles');
			if (!muteRole && !restrictRoles) return;
			const totalCases = this.client.settings.get(newMember.guild, 'caseTotal', 0) + 1;
			this.client.settings.set(newMember.guild, 'caseTotal', totalCases);
			const modLogChannel = this.client.settings.get(newMember.guild, 'modLogChannel');
			const role = newMember.roles.filter(r => r.id !== newMember.guild.id && !oldMember.roles.has(r.id)).first();
			if (!role) return;

			let actionName;
			let action;
			let processed = true;
			if (role.id === muteRole) {
				actionName = 'Mute';
				action = ACTIONS.MUTE;
				processed = false;
			} else if (role.id === restrictRoles.embed) {
				actionName = 'Embed restriction';
				action = ACTIONS.EMBED;
			} else if (role.id === restrictRoles.emoji) {
				actionName = 'Emoji restriction';
				action = ACTIONS.EMOJI;
			} else if (role.id === restrictRoles.reaction) {
				actionName = 'Reaction restriction';
				action = ACTIONS.REACTION;
			} else {
				return;
			}

			let modMessage;
			if (modLogChannel) {
				const prefix = this.client.commandHandler.prefix({ guild: newMember.guild });
				const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
				const color = Object.keys(ACTIONS).find(key => ACTIONS[key] === action);
				const embed = logEmbed({ member: newMember, action: actionName, caseNum: totalCases, reason }).setColor(COLORS[color]);
				modMessage = await this.client.channels.get(modLogChannel).send(embed);
			}
			await this.client.db.models.cases.create({
				guild: newMember.guild.id,
				message: modMessage ? modMessage.id : null,
				case_id: totalCases,
				target_id: newMember.id,
				target_tag: newMember.user.tag,
				action,
				action_processed: processed
			});
		}
	}
}

module.exports = GuildMemberUpdateListener;
