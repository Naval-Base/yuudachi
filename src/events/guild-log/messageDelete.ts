import { on } from 'node:events';
import { Client, Events, type Message, type Webhook } from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { addFields, truncateEmbed } from '../../util/embed';

@injectable()
export default class implements Event {
	public name = 'Guild log message delete';

	public event = Events.MessageDelete;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			if (message.author.bot) {
				continue;
			}
			if (!message.guild) {
				continue;
			}
			if (!message.content && !message.embeds.length && !message.attachments.size) {
				continue;
			}

			try {
				const locale = (await getGuildSetting(message.guild.id, SettingsKeys.Locale)) as string;
				const logChannelId = (await getGuildSetting(message.guild.id, SettingsKeys.GuildLogWebhookId)) as string;
				const ignoreChannels = (await getGuildSetting(message.guild.id, SettingsKeys.LogIgnoreChannels)) as string;
				if (!logChannelId) {
					continue;
				}
				// TODO: ignore based on parent category once .inGuild() is available
				if (
					(message.channel.isThread() && ignoreChannels.includes(message.channel.parentId ?? '')) ||
					ignoreChannels.includes(message.channelId)
				) {
					continue;
				}

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: message.guild.id,
						memberId: message.author.id,
					},
					`Member ${message.author.id} deleted a message`,
				);

				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				let info = i18next.t('log.guild_log.message_deleted.channel', {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: message.channel.toString(),
					lng: locale,
				});
				let embed = addFields({
					author: {
						name: `${message.author.tag} (${message.author.id})`,
						icon_url: message.author.displayAvatarURL(),
					},
					color: 12016895,
					title: i18next.t('log.guild_log.message_deleted.title'),
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					description: `${
						message.content.length
							? message.content
							: i18next.t('log.guild_log.message_deleted.no_content', { lng: locale })
					}`,
					footer: { text: message.id },
					timestamp: new Date().toISOString(),
				});

				if (!message.content && message.embeds.length) {
					info += `\n${i18next.t('log.guild_log.message_deleted.embeds', {
						embeds: message.embeds.length,
						lng: locale,
					})}`;
				}

				if (message.attachments.size) {
					const attachmentParts = [];
					let counter = 1;
					for (const attachment of message.attachments.values()) {
						attachmentParts.push(`[${counter}](${attachment.proxyURL})`);
						counter++;
					}
					info += `\n${i18next.t('log.guild_log.message_deleted.attachments', {
						attachments: attachmentParts.join(' '),
						lng: locale,
					})}`;
				}

				info += `\n${i18next.t('log.guild_log.message_deleted.jump_to', { link: message.url, lng: locale })}`;

				embed = addFields(embed, {
					name: i18next.t('log.guild_log.message_deleted.info', { lng: locale }),
					value: info,
				});

				await webhook.send({
					embeds: [truncateEmbed(embed)],
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
