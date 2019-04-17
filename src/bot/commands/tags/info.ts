import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { Tag } from '../../models/Tags';

export default class TagInfoCommand extends Command {
	public constructor() {
		super('tag-info', {
			category: 'tags',
			description: {
				content: 'Displays information about a tag.',
				usage: '<tag>'
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
						start: (message: Message): string => `${message.author}, what tag do you want information on?`,
						retry: (message: Message, { failure }: { failure: { value: string } }): string => `${message.author}, a tag with the name **${failure.value}** does not exist.`
					}
				}
			]
		});
	}

	public async exec(message: Message, { tag }: { tag: Tag }): Promise<Message | Message[]> {
		const user = await this.client.users.fetch(tag.user);
		let lastModifiedBy;
		try {
			lastModifiedBy = await this.client.users.fetch(tag.last_modified);
		} catch (error) {
			lastModifiedBy = null;
		}
		const guild = this.client.guilds.get(tag.guild);
		const embed = new MessageEmbed()
			.setColor(3447003)
			.addField('❯ Name', tag.name)
			.addField('❯ User', user ? `${user.tag} (ID: ${user.id})` : "Couldn't fetch user.")
			.addField('❯ Guild', guild ? `${guild.name}` : "Couldn't fetch guild.")
			.addField('❯ Aliases', tag.aliases.length ? tag.aliases.map((t): string => `\`${t}\``).sort().join(', ') : 'No aliases.')
			.addField('❯ Uses', tag.uses)
			.addField('❯ Created at', moment.utc(tag.createdAt).format('YYYY/MM/DD hh:mm:ss'))
			.addField('❯ Modified at', moment.utc(tag.updatedAt).format('YYYY/MM/DD hh:mm:ss'));
		if (lastModifiedBy) {
			embed.addField('❯ Last modified by', lastModifiedBy ? `${lastModifiedBy.tag} (ID: ${lastModifiedBy.id})` : "Couldn't fetch user.");
		}

		return message.util!.send(embed);
	}
}
