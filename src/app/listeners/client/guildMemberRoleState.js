const { Listener } = require('discord-akairo');
const RoleState = require('../../models/roleState');

class GuildMemberRoleStateListener extends Listener {
	constructor() {
		super('guildMemberRoleState', {
			event: 'guildMemberUpdate',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(oldMember, newMember) {
		const roleState = this.client.settings.get(newMember.guild, 'roleState', undefined);
		if (roleState) {
			await newMember.guild.members.fetch(newMember.id);
			if (newMember.roles) {
				const roles = newMember.roles.filter(role => role.id !== newMember.guild.id).map(role => role.id);
				const data = await RoleState.findOne({ where: { user: newMember.id, guild: newMember.guild.id } });
				if (roles.length) {
					if (data) {
						await RoleState.update({ roles }, { where: { user: newMember.id, guild: newMember.guild.id } });
					} else {
						await RoleState.create({
							user: newMember.id,
							guild: newMember.guild.id,
							roles
						});
					}
				} else if (data) {
					await data.destroy();
				}
			}
		}
	}
}

module.exports = GuildMemberRoleStateListener;
