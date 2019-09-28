import { Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed, Permissions } from 'discord.js';
import { MESSAGES, PRODUCTION, SETTINGS } from '../../util/constants';
import { GRAPHQL, graphQLClient } from '../../util/graphQL';
import { Tags } from '../../util/graphQLTypes';

export default class TagListCommand extends Command {
	public constructor() {
		super('tag-list', {
			aliases: ['tags'],
			category: 'tags',
			description: {
				content: MESSAGES.COMMANDS.TAGS.LIST.DESCRIPTION,
			},
			channel: 'guild',
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
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
		const restrictedRoles = this.client.settings.get(message.guild!, SETTINGS.RESTRICT_ROLES);
		if (!restrictedRoles) return null;
		const hasRestrictedRole = message.member!.roles.has(restrictedRoles.TAG);
		if (hasRestrictedRole) return 'Restricted';
		return null;
	}

	public async exec(message: Message, { member }: { member: GuildMember }) {
		if (member) {
			const { data } = await graphQLClient.query({
				query: GRAPHQL.QUERY.TAGS_MEMBER,
				variables: {
					guild: message.guild!.id,
					user: member.id,
				},
			});
			let tags: Pick<Tags, 'content' | 'name' | 'hoisted' | 'user'>[];
			if (PRODUCTION) tags = data.tags;
			else tags = data.staging_tags;
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
		const { data } = await graphQLClient.query({
			query: GRAPHQL.QUERY.TAGS,
			variables: {
				guild: message.guild!.id,
			},
		});
		let tags: Tags[];
		if (PRODUCTION) tags = data.tags;
		else tags = data.staging_tags;
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
