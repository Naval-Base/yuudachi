const { Listener } = require('discord-akairo');

class GuildMemberAddListener extends Listener {
	constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	async exec(member) {
		const roleState = this.client.settings.get(member.guild, 'roleState');
		if (roleState) {
			await member.guild.members.fetch(member.id);
			const user = await this.client.db.models.role_states.findOne({ where: { guild: member.guild.id, user: member.id } });
			if (member.roles) await member.roles.add(user.roles, 'Automatic role state');
		}
	}
}

module.exports = GuildMemberAddListener;
