import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';
import { RoleStatesInsertInput } from '../../../util/graphQLTypes';

export default class GuildMemberUpdateRoleStateListener extends Listener {
	public constructor() {
		super('guildMemberUpdateRoleState', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: 'client',
		});
	}

	public async exec(_: GuildMember, newMember: GuildMember) {
		const roleState = this.client.settings.get(newMember.guild, SETTINGS.ROLE_STATE);
		if (roleState) {
			await newMember.guild.members.fetch(newMember.id);
			const roles = newMember.roles.cache.filter((role) => role.id !== newMember.guild.id).map((role) => role.id);
			if (roles.length) {
				await graphQLClient.mutate({
					mutation: GRAPHQL.MUTATION.UPDATE_ROLE_STATE,
					variables: {
						guild: newMember.guild.id,
						member: newMember.id,
						roles: `{${roles.join(',')}}`,
					},
				});
			} else {
				await graphQLClient.mutate<any, RoleStatesInsertInput>({
					mutation: GRAPHQL.MUTATION.DELETE_MEMBER_ROLE_STATE,
					variables: {
						guild: newMember.guild.id,
						member: newMember.id,
					},
				});
			}
		}
	}
}
