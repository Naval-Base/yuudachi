import { Client, Constants, Message, Webhook } from 'discord.js';
import i18next from 'i18next';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { addFields, truncateEmbed } from '../../util/embed';

@injectable()
export default class implements Event {
	public name = 'Guild log message delete';

	public event = Constants.Events.MESSAGE_DELETE;

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
			if (!message.content && !message.embeds.length) {
				continue;
			}

			try {
				const locale = await getGuildSetting(message.guild.id, SettingsKeys.Locale);
				const logChannelId = await getGuildSetting(message.guild.id, SettingsKeys.GuildLogWebhookId);
				if (!logChannelId) {
					continue;
				}
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
					description: `${message.content ?? i18next.t('log.guild_log.message_deleted.no_content', { lng: locale })}`,
					timestamp: new Date().toISOString(),
				});

				if (!message.content && message.embeds.length) {
					info += `\n${i18next.t('log.guild_log.message_deleted.embeds', {
						embeds: message.embeds.length,
						lng: locale,
					})}`;
				}
				info += `\n${i18next.t('log.guild_log.message_deleted.jump_to', { link: message.url, lng: locale })}`;

				embed = addFields(embed, {
					name: i18next.t('log.guild_log.message_deleted.info', { lng: locale }),
					value: info,
				});

				await webhook.send({
					// @ts-ignore
					embeds: [truncateEmbed(embed)],
					username: this.client.user.username,
					avatarURL: this.client.user.displayAvatarURL(),
				});
			} catch (e) {
				logger.error(e, e.message);
			}

			continue;
		}
	}
}
