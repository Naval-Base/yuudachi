import { Buffer } from 'node:buffer';
import { on } from 'node:events';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import {
	Client,
	type Collection,
	Events,
	type Message,
	type Snowflake,
	type Webhook,
	MessageType,
	messageLink,
} from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kWebhooks } from '../../tokens.js';
import { addFields, truncateEmbed } from '../../util/embed.js';

dayjs.extend(relativeTime);
dayjs.extend(utc);

const DATE_FORMAT_WITH_SECONDS = 'YYYY/MM/DD HH:mm:ss';

@injectable()
export default class implements Event {
	public name = 'Guild log message bulk delete';

	public event = Events.MessageBulkDelete as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [messages] of on(this.client, this.event) as AsyncIterableIterator<
			[Collection<Snowflake, Message>]
		>) {
			const userMessages = messages.filter((msg) => !msg.author.bot);
			const firstMessage = userMessages.first();

			if (!firstMessage?.inGuild()) {
				continue;
			}

			try {
				const guildLogWebhookId = await getGuildSetting(firstMessage.guild.id, SettingsKeys.GuildLogWebhookId);
				const ignoreChannels = await getGuildSetting(firstMessage.guild.id, SettingsKeys.LogIgnoreChannels);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				if (
					ignoreChannels.includes(firstMessage.channelId) ||
					(firstMessage.channel.parentId && ignoreChannels.includes(firstMessage.channel.parentId)) ||
					(firstMessage.channel.parent?.parentId && ignoreChannels.includes(firstMessage.channel.parent.parentId))
				) {
					continue;
				}

				const locale = await getGuildSetting(firstMessage.guild.id, SettingsKeys.Locale);

				const output = userMessages
					.map((message) => {
						const outParts = [
							`[${dayjs(message.createdTimestamp).utc().format(DATE_FORMAT_WITH_SECONDS)} (UTC)] ${
								message.author.tag
							} (${message.author.id}): ${message.cleanContent ? message.cleanContent.replace(/\n/g, '\n') : ''}`,
						];

						if (message.attachments.size) {
							outParts.push(
								message.attachments
									.map((attachment) =>
										i18next.t('log.guild_log.message_bulk_deleted.attachment', {
											url: attachment.proxyURL,
											lng: locale,
										}),
									)
									.join('\n'),
							);
						}

						if (message.stickers.size) {
							outParts.push(
								message.stickers
									.map((sticker) =>
										i18next.t('log.guild_log.message_bulk_deleted.sticker', {
											name: sticker.name,
											lng: locale,
										}),
									)
									.join('\n'),
							);
						}

						if (message.type === MessageType.Reply && message.reference && message.mentions.repliedUser) {
							const { channelId, messageId, guildId } = message.reference;
							const replyURL = messageLink(channelId, messageId!, guildId!);

							outParts.push(
								message.mentions.users.has(message.mentions.repliedUser.id)
									? i18next.t('log.guild_log.message_bulk_deleted.reply_to_mentions', {
											message_id: messageId,
											message_url: replyURL,
											user_tag: message.mentions.repliedUser.tag,
											user_id: message.mentions.repliedUser.id,
											lng: locale,
									  })
									: i18next.t('log.guild_log.message_bulk_deleted.reply_to', {
											message_id: messageId,
											message_url: replyURL,
											user_tag: message.mentions.repliedUser.tag,
											user_id: message.mentions.repliedUser.id,
											lng: locale,
									  }),
							);
						}

						return outParts.join('\n');
					})
					.join('\n');

				const embed = addFields({
					author: {
						name: `${firstMessage.author.tag} (${firstMessage.author.id})`,
						icon_url: firstMessage.author.displayAvatarURL(),
					},
					color: 12016895,
					title: i18next.t('log.guild_log.message_bulk_deleted.title', { lng: locale }),
					description: i18next.t('log.guild_log.message_bulk_deleted.description', {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: `${firstMessage.channel.toString()} - ${
							firstMessage.inGuild() ? firstMessage.channel.name : ''
						} (${firstMessage.channel.id})`,
						lng: locale,
					}),
					timestamp: new Date().toISOString(),
				});

				await webhook.send({
					embeds: [truncateEmbed(embed)],
					files: [{ name: 'logs.txt', attachment: Buffer.from(output, 'utf-8') }],
					username: this.client.user.username,
					avatarURL: this.client.user.displayAvatarURL(),
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}
