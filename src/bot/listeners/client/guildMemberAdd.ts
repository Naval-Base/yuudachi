import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { RoleState } from '../../models/RoleStates';
import { SETTINGS } from '../../util/constants';

export default class GuildMemberAddListener extends Listener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const roleState = this.client.settings.get<boolean>(member.guild, SETTINGS.ROLE_STATE, undefined);
		if (roleState) {
			const roleStateRepo = this.client.db.getRepository(RoleState);
			const user = await roleStateRepo.findOne({ guild: member.guild.id, user: member.id });
			try {
				if (user && member.roles) {
					await this.client.muteScheduler.check();
					await member.roles.add(user.roles, 'Automatic role state');
				}
			} catch {}
		}
	}
}
