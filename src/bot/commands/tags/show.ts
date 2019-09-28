import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagShowCommand extends Command {
	public constructor() {
		super('tag-show', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.SHOW.DESCRIPTION,
				usage: '<tag>',
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					match: 'content',
					type: 'lowercase',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.SHOW.PROMPT.START(message.author),
					},
				},
			],
		});
	}

	public async exec(message: Message, { name }: { name: string }) {
		if (!name) return;
		const restrictedRoles = this.client.settings.get(message.guild!, SETTINGS.RESTRICT_ROLES);
		if (restrictedRoles) {
			if (message.member!.roles.has(restrictedRoles.TAG)) return;
		}
		name = Util.cleanContent(name, message);
		const { data } = await graphQLClient.query({
			query: GRAPHQL.QUERY.TAGS_TYPE,
			variables: {
				guild: message.guild!.id,
			},
		});
		let tags: Tags[];
		if (PRODUCTION) tags = data.tags;
		else tags = data.staging_tags;
		const [tag] = tags.filter(t => t.name === name || t.aliases.includes(name));
		if (!tag) return;
		graphQLClient.mutate({
			mutation: GRAPHQL.MUTATION.UPDATE_TAG_USAGE,
			variables: {
				id: tag.id,
				uses: tag.uses + 1,
			},
		});

		return message.util!.send(tag.content);
	}
}
