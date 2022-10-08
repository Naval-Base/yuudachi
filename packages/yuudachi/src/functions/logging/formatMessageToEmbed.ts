import { truncateEmbed } from "@yuudachi/framework";
import type { Message } from "discord.js";
import i18next from "i18next";
import { Color } from "../../Constants.js";

export function formatMessageToEmbed(message: Message<true>, locale: string) {
	let embed = truncateEmbed({
		author: {
			name: `${message.author.tag} (${message.author.id})`,
			url: message.url,
			icon_url: message.author.displayAvatarURL(),
		},
		description: message.content.length
			? message.content
			: i18next.t("common.errors.no_content", {
					lng: locale,
			  }),
		timestamp: message.createdAt.toISOString(),
		footer: {
			text: `#${message.channel.name}`,
		},
		color: Color.DiscordEmbedBackground,
	});

	const attachment = message.attachments.first();
	const attachmentIsImage = attachment?.contentType === "image/jpeg" || attachment?.contentType === "image/png";

	if (attachmentIsImage) {
		embed = {
			...embed,
			image: {
				url: attachment.url,
			},
		};
	}

	return embed;
}
