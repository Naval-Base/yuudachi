import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { RoleStates } from '../../util/graphQLTypes';

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
			const { data } = await graphQLClient.query({
				query: GRAPHQL.QUERY.ROLE_STATES,
				variables: {
					guild: member.guild.id,
					member: member.id,
				},
			});
			let user: RoleStates;
			if (PRODUCTION) user = data.role_states[0];
			else user = data.staging_role_states[0];
			try {
				if (user && member.roles) {
					await this.client.muteScheduler.check();
					await member.roles.add(user.roles, MESSAGES.EVENTS.GUILD_MEMBER_ADD.ROLE_STATE);
				}
			} catch {}
		}
	}
}
