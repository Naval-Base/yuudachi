import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagDeleteCommand extends Command {
	public constructor() {
		super('tag-delete', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.DELETE.DESCRIPTION,
				usage: '<tag>',
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					match: 'content',
					type: 'tag',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.DELETE.PROMPT.START(message.author),
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							MESSAGES.COMMANDS.TAGS.DELETE.PROMPT.RETRY(message.author, failure.value),
					},
				},
			],
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const restrictedRoles = this.client.settings.get<{ TAG: string }>(
			message.guild!,
			SETTINGS.RESTRICT_ROLES,
			undefined,
		);
		if (!restrictedRoles) return null;
		const hasRestrictedRole = message.member!.roles.has(restrictedRoles.TAG);
		if (hasRestrictedRole) return 'Restricted';
		return null;
	}

	public async exec(message: Message, { tag }: { tag: Tags }) {
		const staffRole = message.member!.roles.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE, undefined));
		if (tag.user !== message.author!.id && !staffRole) {
			return message.util!.reply(MESSAGES.COMMANDS.TAGS.DELETE.OWN_TAG);
		}
		await graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.DELETE_TAG,
			variables: {
				id: tag.id,
			},
		});

		return message.util!.reply(MESSAGES.COMMANDS.TAGS.DELETE.REPLY(tag.name.substring(0, 1900)));
	}
}
