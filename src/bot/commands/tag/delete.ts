import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags, TagsInsertInput } from '../../util/graphQLTypes';

export default class TagDeleteCommand extends Command {
	public constructor() {
		super('tag-delete', {
			category: 'tag',
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

	public async exec(message: Message, { tag }: { tag: Tags }) {
		const staffRole = message.member?.roles.cache.has(this.client.settings.get(message.guild!, SETTINGS.MOD_ROLE));
		if (tag.user !== message.author.id && !staffRole) {
			return message.util?.reply(MESSAGES.COMMANDS.TAGS.DELETE.OWN_TAG);
		}
		await graphQLClient.mutate<any, TagsInsertInput>({
			mutation: GRAPHQL.MUTATION.DELETE_TAG,
			variables: {
				id: tag.id,
			},
		});

		return message.util?.reply(MESSAGES.COMMANDS.TAGS.DELETE.REPLY(tag.name.substring(0, 1900)));
	}
}
