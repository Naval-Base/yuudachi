import { Buffer } from 'node:buffer';
import { on } from 'node:events';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import { Client, type Collection, Events, type Message, type Snowflake, type Webhook } from 'discord.js';
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
			if (!messages.size) {
				continue;
			}

			const message = messages.first()!;

			if (message.author.bot) {
				continue;
			}

			if (!message.guild) {
				continue;
			}

			try {
				const guildLogWebhookId = await getGuildSetting(message.guild.id, SettingsKeys.GuildLogWebhookId);
				const ignoreChannels = await getGuildSetting(message.guild.id, SettingsKeys.LogIgnoreChannels);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				// TODO: ignore based on parent category once .inGuild() is available
				if (
					(message.channel.isThread() && ignoreChannels.includes(message.channel.parentId ?? '')) ||
					ignoreChannels.includes(message.channelId)
				) {
					continue;
				}

				const locale = await getGuildSetting(message.guild.id, SettingsKeys.Locale);

				const output = messages.reduce((out, msg) => {
					out += `[${dayjs(msg.createdTimestamp).utc().format(DATE_FORMAT_WITH_SECONDS)} (UTC)] ${msg.author.tag} (${
						msg.author.id
					}): ${msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\n') : ''}${
						msg.attachments.size
							? `\n${msg.attachments
									.map((attachment) =>
										i18next.t('log.guild_log.message_bulk_deleted.attachment', {
											url: attachment.proxyURL,
											lng: locale,
										}),
									)
									.join('\n')}`
							: ''
					}${
						msg.stickers.size
							? `\n${msg.stickers
									.map((sticker) =>
										i18next.t('log.guild_log.message_bulk_deleted.sticker', {
											name: sticker.name,
											lng: locale,
										}),
									)
									.join('\n')}`
							: ''
					}\n`;
					return out;
				}, '');

				const embed = addFields({
					author: {
						name: `${message.author.tag} (${message.author.id})`,
						icon_url: message.author.displayAvatarURL(),
					},
					color: 12016895,
					title: i18next.t('log.guild_log.message_bulk_deleted.title', { lng: locale }),
					description: i18next.t('log.guild_log.message_bulk_deleted.description', {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: message.channel.toString(),
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
