const { Listener } = require('discord-akairo');
const RoleState = require('../../models/roleState');

class GuildMemberAddListener extends Listener {
	constructor() {
		super('guildMemberAdd', {
			event: 'guildMemberAdd',
			emitter: 'client',
			category: 'client'
		});
	}

	async exec(member) {
		const roleState = this.client.settings.get(member.guild, 'roleState', undefined);
		if (roleState) {
			const user = await RoleState.findOne({ where: { user: member.id, guild: member.guild.id } });
			try {
				if (user) await member.roles.add(user.roles, 'Automatic RoleState');
			} catch {} // eslint-disable-line
		}

		const memberLog = this.client.settings.get(member.guild, 'memberLog', undefined);
		if (memberLog && this.client.channels.has(memberLog)) {
			const embed = this.client.util.embed().setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
				.setFooter('User Joined')
				.setColor('GREEN')
				.setTimestamp();
			return member.guild.channels.get(memberLog).send({ embed });
		}
	}
}

module.exports = GuildMemberAddListener;
