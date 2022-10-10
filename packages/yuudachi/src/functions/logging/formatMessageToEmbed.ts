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
	const attachmentIsImage = ["image/jpeg", "image/png", "image/gif"].includes(attachment?.contentType ?? "");
	const attachmentIsImageNaive = [".jpg", ".png", ".gif"].some((ext) => attachment?.name?.endsWith(ext));

	if (attachment && (attachmentIsImage || attachmentIsImageNaive)) {
		embed = {
			...embed,
			image: {
				url: attachment.url,
			},
		};
	}

	return embed;
}
