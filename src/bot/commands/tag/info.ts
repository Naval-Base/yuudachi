import { Command } from 'discord-akairo';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { DATE_FORMAT_WITH_SECONDS, MESSAGES } from '../../util/constants';
import { Tags } from '../../util/graphQLTypes';

export default class TagInfoCommand extends Command {
	public constructor() {
		super('tag-info', {
			category: 'tag',
			description: {
				content: MESSAGES.COMMANDS.TAGS.INFO.DESCRIPTION,
				usage: '<tag>',
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					match: 'content',
					type: 'tag',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.TAGS.INFO.PROMPT.START(message.author),
						retry: (message: Message, { failure }: { failure: { value: string } }) =>
							MESSAGES.COMMANDS.TAGS.INFO.PROMPT.RETRY(message.author, failure.value),
					},
				},
			],
		});
	}

	public async exec(message: Message, { tag }: { tag: Tags }) {
		const user = await this.client.users.fetch(tag.user);
		let lastModifiedBy;
		try {
			lastModifiedBy = await this.client.users.fetch(tag.lastModified ?? '');
		} catch (error) {
			lastModifiedBy = null;
		}
		const guild = this.client.guilds.cache.get(tag.guild);
		const embed = new MessageEmbed().setColor(3447003).addField('❯ Name', `\`${tag.name}\``);
		if (tag.templated) {
			embed.addField('❯ Templated', '❗This tag is templated and resolves mentions and templates.');
		}

		const sinceCreationFormatted = moment.utc(tag.createdAt).fromNow();
		const creationFormatted = moment.utc(tag.createdAt).format(DATE_FORMAT_WITH_SECONDS);
		const sinceModifiedFormatted = moment.utc(tag.updatedAt).fromNow();
		const modifiedFormatted = moment.utc(tag.updatedAt).format(DATE_FORMAT_WITH_SECONDS);

		embed
			.addField('❯ User', user ? `\`${user.tag}\` (${user.id})` : "Couldn't fetch user.")
			.addField('❯ Guild', guild ? `\`${guild.name}\`` : "Couldn't fetch guild.")
			.addField(
				'❯ Aliases',
				tag.aliases.length
					? tag.aliases
							.map((t) => `\`${t}\``)
							.sort()
							.join(', ')
					: 'No aliases.',
			)
			.addField('❯ Uses', `${tag.uses}`)
			.addField('❯ Created', `\`${creationFormatted} (UTC)\` (${sinceCreationFormatted})`)
			.addField('❯ Last Modified', `\`${modifiedFormatted} (UTC)\` (${sinceModifiedFormatted})`);
		if (lastModifiedBy) {
			embed.addField(
				'❯ Last modified by',
				lastModifiedBy ? `\`${lastModifiedBy.tag}\` (${lastModifiedBy.id})` : "Couldn't fetch user.",
			);
		}

		return message.util?.send(embed);
	}
}
