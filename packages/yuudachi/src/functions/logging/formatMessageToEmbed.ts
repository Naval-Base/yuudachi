import type { Message } from 'discord.js';
import i18next from 'i18next';
import { Color } from '../../Constants.js';
import { truncateEmbed } from '../../util/embed.js';

export function formatMessageToEmbed(message: Message<true>, locale: string) {
	return truncateEmbed({
		author: {
			name: `${message.author.tag} (${message.author.id})`,
			url: message.url,
			icon_url: message.author.displayAvatarURL(),
		},
		description: message.content.length
			? message.content
			: i18next.t('common.errors.no_content', {
					lng: locale,
			  }),
		timestamp: message.createdAt.toISOString(),
		footer: {
			text: `#${message.channel.name}`,
		},
		color: Color.DiscordEmbedBackground,
	});
}
