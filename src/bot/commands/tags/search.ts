import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions, Util } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class SearchTagCommand extends Command {
	public constructor() {
		super('tag-search', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.SEARCH.DESCRIPTION,
				usage: '<tag>',
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'name',
					match: 'content',
					type: 'lowercase',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.SEARCH.PROMPT.START(message.author),
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

	public async exec(message: Message, { name }: { name: string }) {
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
		tags = tags.filter(t => t.name.includes(name) || t.aliases.some(a => a.includes(name)));
		if (!tags.length) return message.util!.reply(MESSAGES.COMMANDS.TAGS.SEARCH.NO_RESULT(name));
		const search = tags
			.map(tag => `\`${tag.name}\``)
			.sort()
			.join(', ');
		if (search.length >= 1950) {
			return message.util!.reply(MESSAGES.COMMANDS.TAGS.SEARCH.TOO_BIG);
		}
		const embed = new MessageEmbed()
			.setColor(0x30a9ed)
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL())
			.setDescription(search);

		return message.util!.send(embed);
	}
}
