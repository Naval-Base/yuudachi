import dayjs from "dayjs";
import {
	type Collection,
	type Message,
	messageLink,
	MessageType,
	type PartialMessage,
	type Snowflake,
} from "discord.js";
import i18next from "i18next";
import kleur from "kleur";
import { DATE_FORMAT_WITH_SECONDS } from "../../Constants.js";

kleur.enabled = true;

export function formatMessagesToAttachment(
	messages: Collection<Snowflake, Message | PartialMessage>,
	locale: string,
	primaryHighlightMessageIds: Snowflake[] = [],
	secondaryHighlighMessageIds: Snowflake[] = [],
) {
	return messages
		.map((message) => {
			const isPrimaryHighlight = primaryHighlightMessageIds.includes(message.id);
			const isSecondaryHighlight = secondaryHighlighMessageIds.includes(message.id);
			const outParts = [
				`[${dayjs(message.createdTimestamp).utc().format(DATE_FORMAT_WITH_SECONDS)} (UTC)] ${
					message.author?.tag ?? "Unknown author"
				} (${message.author?.id ?? "Unknown author"}): ${
					message.cleanContent ? message.cleanContent.replaceAll("\n", "\n") : ""
				}`,
			];

			if (message.attachments.size) {
				outParts.push(
					message.attachments
						.map((attachment) =>
							i18next.t("log.guild_log.message_bulk_deleted.attachment", {
								url: attachment.proxyURL,
								lng: locale,
							}),
						)
						.join("\n"),
				);
			}

			if (message.stickers.size) {
				outParts.push(
					message.stickers
						.map((sticker) =>
							i18next.t("log.guild_log.message_bulk_deleted.sticker", {
								name: sticker.name,
								lng: locale,
							}),
						)
						.join("\n"),
				);
			}

			if (message.type === MessageType.Reply && message.reference && message.mentions.repliedUser) {
				const { channelId, messageId, guildId } = message.reference;
				const replyURL = messageLink(channelId, messageId!, guildId!);

				outParts.push(
					message.mentions.users.has(message.mentions.repliedUser.id)
						? i18next.t("log.guild_log.message_bulk_deleted.reply_to_mentions", {
								message_id: messageId,
								message_url: replyURL,
								user_tag: message.mentions.repliedUser.tag,
								user_id: message.mentions.repliedUser.id,
								lng: locale,
						  })
						: i18next.t("log.guild_log.message_bulk_deleted.reply_to", {
								message_id: messageId,
								message_url: replyURL,
								user_tag: message.mentions.repliedUser.tag,
								user_id: message.mentions.repliedUser.id,
								lng: locale,
						  }),
				);
			}

			const outSection = outParts.join("\n");
			return isPrimaryHighlight
				? kleur.yellow(outSection)
				: isSecondaryHighlight
				  ? kleur.white(outSection)
				  : outSection;
		})
		.join("\n");
}
