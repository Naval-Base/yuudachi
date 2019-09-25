import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { MESSAGES, SETTINGS } from '../../util/constants';
import { Tags } from '../../util/graphQLTypes';

export default class TagInfoCommand extends Command {
	public constructor() {
		super('tag-info', {
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.INFO.DESCRIPTION,
				usage: '<tag>',
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
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
		const user = await this.client.users.fetch(tag.user);
		let lastModifiedBy;
		try {
			lastModifiedBy = await this.client.users.fetch(tag.last_modified!);
		} catch (error) {
			lastModifiedBy = null;
		}
		const guild = this.client.guilds.get(tag.guild);
		const embed = new MessageEmbed()
			.setColor(3447003)
			.addField('❯ Name', tag.name)
			.addField('❯ User', user ? `${user.tag} (ID: ${user.id})` : "Couldn't fetch user.")
			.addField('❯ Guild', guild ? `${guild.name}` : "Couldn't fetch guild.")
			.addField(
				'❯ Aliases',
				tag.aliases.length
					? tag.aliases
							.map(t => `\`${t}\``)
							.sort()
							.join(', ')
					: 'No aliases.',
			)
			.addField('❯ Uses', tag.uses)
			.addField('❯ Created at', moment.utc(tag.created_at).format('YYYY/MM/DD hh:mm:ss'))
			.addField('❯ Modified at', moment.utc(tag.updated_at).format('YYYY/MM/DD hh:mm:ss'));
		if (lastModifiedBy) {
			embed.addField(
				'❯ Last modified by',
				lastModifiedBy ? `${lastModifiedBy.tag} (ID: ${lastModifiedBy.id})` : "Couldn't fetch user.",
			);
		}

		return message.util!.send(embed);
	}
}
