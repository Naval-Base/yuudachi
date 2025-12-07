import { on } from "node:events";
import { inject, injectable } from "@needle-di/core";
import { logger, kWebhooks, addFields, truncateEmbed } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, ChannelType, Events, messageLink, MessageType, type Message, type Webhook } from "discord.js";
import i18next from "i18next";
import { Color } from "../../Constants.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Guild log message delete";

	public event = Events.MessageDelete as const;

	public constructor(
		public readonly client: Client<true> = inject(Client),
		public readonly webhooks: Map<string, Webhook> = inject(kWebhooks),
	) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			if (message.author.bot) {
				continue;
			}

			if (!message.inGuild()) {
				continue;
			}

			if (!message.content.length && !message.embeds.length && !message.attachments.size && !message.stickers.size) {
				continue;
			}

			try {
				const guildLogWebhookId = await getGuildSetting(message.guild.id, SettingsKeys.GuildLogWebhookId);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				const ignoreChannels = await getGuildSetting(message.guild.id, SettingsKeys.LogIgnoreChannels);

				if (
					ignoreChannels.includes(message.channelId) ||
					(message.channel.parentId && ignoreChannels.includes(message.channel.parentId)) ||
					(message.channel.parent?.parentId && ignoreChannels.includes(message.channel.parent.parentId))
				) {
					continue;
				}

				const locale = await getGuildSetting(message.guild.id, SettingsKeys.Locale);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: message.guild.id,
						memberId: message.author.id,
						channelId: message.channelId,
						channelType: ChannelType[message.channel.type],
					},
					`Message by ${message.author.id} deleted in channel ${message.channelId}`,
				);

				const infoParts = [
					i18next.t("log.guild_log.message_deleted.channel", {
						channel: `${message.channel.toString()} - ${message.channel.name} (${message.channel.id})`,
						lng: locale,
					}),
				];

				let embed = addFields({
					author: {
						name: `${message.author.tag} (${message.author.id})`,
						icon_url: message.author.displayAvatarURL(),
					},
					color: Color.LogsMessageDelete,
					title: i18next.t("log.guild_log.message_deleted.title"),
					description: `${
						message.content.length ? message.content : i18next.t("common.errors.no_content", { lng: locale })
					}`,
					footer: { text: message.id },
					timestamp: new Date().toISOString(),
				});

				if (!message.content && message.embeds.length) {
					infoParts.push(
						i18next.t("log.guild_log.message_deleted.embeds", {
							embeds: message.embeds.length,
							lng: locale,
						}),
					);
				}

				if (message.attachments.size) {
					const attachmentParts = [];
					let counter = 1;
					for (const attachment of message.attachments.values()) {
						attachmentParts.push(`[${counter}](${attachment.proxyURL})`);
						counter++;
					}

					infoParts.push(
						i18next.t("log.guild_log.message_deleted.attachments", {
							attachments: attachmentParts.join(" "),
							lng: locale,
						}),
					);
				}

				if (message.stickers.size) {
					infoParts.push(
						i18next.t("log.guild_log.message_deleted.stickers", {
							stickers: message.stickers.map((sticker) => `\`${sticker.name}\``).join(", "),
							lng: locale,
						}),
					);
				}

				infoParts.push(i18next.t("log.guild_log.message_deleted.jump_to", { link: message.url, lng: locale }));

				if (message.type === MessageType.Reply && message.reference && message.mentions.repliedUser) {
					const { channelId, messageId, guildId } = message.reference;
					const replyURL = messageLink(channelId, messageId!, guildId!);

					infoParts.push(
						message.mentions.users.has(message.mentions.repliedUser.id)
							? i18next.t("log.guild_log.message_deleted.reply_to_mentions", {
									message_id: messageId,
									message_url: replyURL,
									user_tag: message.mentions.repliedUser.tag,
									user_id: message.mentions.repliedUser.id,
									lng: locale,
								})
							: i18next.t("log.guild_log.message_deleted.reply_to", {
									message_id: messageId,
									message_url: replyURL,
									user_tag: message.mentions.repliedUser.tag,
									user_id: message.mentions.repliedUser.id,
									lng: locale,
								}),
					);
				}

				embed = addFields(embed, {
					name: "\u200B",
					value: infoParts.join("\n"),
				});

				await webhook.send({
					embeds: [truncateEmbed(embed)],
					username: this.client.user.username,
					avatarURL: this.client.user.displayAvatarURL(),
				});
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
