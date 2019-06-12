const { Listener } = require('discord-akairo');

class GuildMemberRemoveListener extends Listener {
	constructor() {
		super('guildMemberRemove', {
			event: 'guildMemberRemove',
			emitter: 'client',
			category: 'client'
		});
	}

	exec(member) {
		const memberLog = this.client.settings.get(member.guild, 'memberLog', undefined);
		if (memberLog && this.client.channels.has(memberLog)) {
			const embed = this.client.util.embed().setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
				.setFooter('User Left')
				.setColor('RED')
				.setTimestamp();
			return member.guild.channels.get(memberLog).send({ embed });
		}
	}
}

module.exports = GuildMemberRemoveListener;
