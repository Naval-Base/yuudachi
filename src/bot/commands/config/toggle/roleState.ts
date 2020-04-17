import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../../util/constants';
import { GRAPHQL, graphQLClient } from '../../../util/graphQL';

export default class ToggleRoleStateCommand extends Command {
	public constructor() {
		super('config-toggle-role-state', {
			description: {
				content: MESSAGES.COMMANDS.CONFIG.TOGGLE.ROLE_STATE.DESCRIPTION,
			},
			category: 'config',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			ratelimit: 2,
		});
	}

	public async exec(message: Message) {
		const guild = message.guild!;
		const roleState = this.client.settings.get(guild, SETTINGS.ROLE_STATE);
		if (roleState) {
			this.client.settings.set(guild, SETTINGS.ROLE_STATE, false);
			await graphQLClient.mutate({
				mutation: GRAPHQL.MUTATION.DELETE_ROLE_STATE,
				variables: {
					guild: guild.id,
				},
			});

			return message.util?.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.ROLE_STATE.REPLY_DEACTIVATED);
		}
		this.client.settings.set(guild, SETTINGS.ROLE_STATE, true);
		const members = await guild.members.fetch();
		const records = [];
		for (const member of members.values()) {
			const roles = member.roles.cache.filter((role) => role.id !== guild.id).map((role) => role.id);
			if (!roles.length) continue;
			records.push({
				guild: guild.id,
				member: member.id,
				roles: `{${roles.join(',')}}`,
			});
		}
		await graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.INSERT_ROLE_STATE,
			variables: {
				objects: records,
			},
		});

		return message.util?.reply(MESSAGES.COMMANDS.CONFIG.TOGGLE.ROLE_STATE.REPLY_ACTIVATED);
	}
}
