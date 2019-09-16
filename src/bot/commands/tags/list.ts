import { Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Tag } from '../../models/Tags';
import { MESSAGES, SETTINGS } from '../../util/constants';

export default class TagListCommand extends Command {
	public constructor() {
		super('tag-list', {
			aliases: ['tags'],
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.LIST.DESCRIPTION,
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
				},
			],
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const restrictedRoles = this.client.settings.get<{ tag: string }>(
			message.guild!,
			SETTINGS.RESTRICT_ROLES,
			undefined,
		);
		if (!restrictedRoles) return null;
		const hasRestrictedRole = message.member!.roles.has(restrictedRoles.tag);
		if (hasRestrictedRole) return 'Restricted';
		return null;
	}

	public async exec(message: Message, { member }: { member: GuildMember }) {
		const tagsRepo = this.client.db.getRepository(Tag);
		if (member) {
			const tags = await tagsRepo.find({ user: member.id, guild: message.guild!.id });
			if (!tags.length) {
				if (member.id === message.author!.id) return message.util!.reply(MESSAGES.COMMANDS.TAGS.LIST.NO_TAGS());
				return message.util!.reply(MESSAGES.COMMANDS.TAGS.LIST.NO_TAGS(member.displayName));
			}
			const embed = new MessageEmbed()
				.setColor(0x30a9ed)
				.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
				.setDescription(
					tags
						.map(tag => `\`${tag.name}\``)
						.sort()
						.join(', '),
				);

			return message.util!.send(embed);
		}
		const tags = await tagsRepo.find({ guild: message.guild!.id });
		if (!tags.length) return message.util!.send(MESSAGES.COMMANDS.TAGS.LIST.GUILD_NO_TAGS(message.guild!.name));
		const hoistedTags = tags
			.filter(tag => tag.hoisted)
			.map(tag => `\`${tag.name}\``)
			.sort()
			.join(', ');
		const userTags = tags
			.filter(tag => !tag.hoisted)
			.filter(tag => tag.user === message.author!.id)
			.map(tag => `\`${tag.name}\``)
			.sort()
			.join(', ');
		const embed = new MessageEmbed()
			.setColor(0x30a9ed)
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL());
		if (hoistedTags) embed.addField('❯ Tags', hoistedTags);
		if (userTags) embed.addField(`❯ ${message.member!.displayName}'s tags`, userTags);

		return message.util!.send(embed);
	}
}
