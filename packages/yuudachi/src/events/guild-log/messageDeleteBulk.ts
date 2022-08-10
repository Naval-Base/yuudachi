import { Buffer } from 'node:buffer';
import { on } from 'node:events';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import { Client, type Collection, Events, type Message, type Snowflake, type Webhook } from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import { Color } from '../../Constants.js';
import type { Event } from '../../Event.js';
import { formatMessagesToAttachment } from '../../functions/logging/formatMessagesToAttachment.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kWebhooks } from '../../tokens.js';
import { addFields, truncateEmbed } from '../../util/embed.js';

dayjs.extend(relativeTime);
dayjs.extend(utc);

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

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				const ignoreChannels = await getGuildSetting(firstMessage.guild.id, SettingsKeys.LogIgnoreChannels);

				if (
					ignoreChannels.includes(firstMessage.channelId) ||
					(firstMessage.channel.parentId && ignoreChannels.includes(firstMessage.channel.parentId)) ||
					(firstMessage.channel.parent?.parentId && ignoreChannels.includes(firstMessage.channel.parent.parentId))
				) {
					continue;
				}

				const uniqueAuthors = new Set<Snowflake>();
				for (const message of userMessages.values()) {
					uniqueAuthors.add(message.author.id);
				}

				const locale = await getGuildSetting(firstMessage.guild.id, SettingsKeys.Locale);

				const embed = addFields({
					author: {
						name:
							uniqueAuthors.size === 1
								? `${firstMessage.author.tag} (${firstMessage.author.id})`
								: i18next.t('log.guild_log.message_bulk_deleted.multiple_authors', { lng: locale }),
						icon_url:
							uniqueAuthors.size === 1 ? firstMessage.author.displayAvatarURL() : this.client.user.displayAvatarURL(),
					},
					color: Color.LogsMessageDelete,
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
					files: [
						{ name: 'logs.txt', attachment: Buffer.from(formatMessagesToAttachment(userMessages, locale), 'utf-8') },
					],
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
