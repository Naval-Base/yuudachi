import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { RoleStates, RoleStatesInsertInput } from '../../../util/graphQLTypes';

export default class GuildMemberAddRoleStateListener extends Listener {
	public constructor() {
		super('guildMemberAddRoleState', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember) {
		const roleState = this.client.settings.get(member.guild, SETTINGS.ROLE_STATE);
		if (roleState) {
			const { data } = await graphQLClient.query<any, RoleStatesInsertInput>({
				query: GRAPHQL.QUERY.ROLE_STATES,
				variables: {
					guild: member.guild.id,
					member: member.id,
				},
			});
			let user: RoleStates;
			if (PRODUCTION) user = data.roleStates[0];
			else user = data.roleStatesStaging[0];
			try {
				if (user && member.roles) {
					await this.client.muteScheduler.check();
					await member.roles.add(user.roles, MESSAGES.EVENTS.GUILD_MEMBER_ADD.ROLE_STATE);
				}
			} catch (error) {
				this.client.logger.error(error);
			}
		}
	}
}
