import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { GRAPHQL, SETTINGS } from '../../util/constants';
import { graphQLClient } from '../../util/graphQL';

export default class GuildMemberUpdateRoleStateListener extends Listener {
	public constructor() {
		super('guildMemberUpdateRoleState', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: 'client',
		});
	}

	public async exec(_: GuildMember, newMember: GuildMember) {
		const roleState = this.client.settings.get<string>(newMember.guild, SETTINGS.ROLE_STATE, undefined);
		if (roleState) {
			await newMember.guild.members.fetch(newMember.id);
			if (newMember.roles) {
				const roles = newMember.roles.filter(role => role.id !== newMember.guild.id).map(role => role.id);
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
					await graphQLClient.mutate({
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
}
