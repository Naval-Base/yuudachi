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
		public readonly client: Client,
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

			try {
				const logChannelId = await getGuildSetting(message.guild.id, SettingsKeys.GuildLogWebhookId);
				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				let info = `${i18next.t('log.guild_log.message_deleted.channel', { channel: message.channel.toString() })}`;
				let embed = addFields({
					author: {
						name: `${message.author.tag} (${message.author.id})`,
						icon_url: message.author.displayAvatarURL(),
					},
					color: 3092790,
					title: i18next.t('log.guild_log.message_deleted.title'),
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					description: `${message.content ?? i18next.t('log.guild_log.message_deleted.no_content')}`,
					timestamp: new Date().toISOString(),
				});

				if (!message.content && message.embeds.length) {
					info += `\n${i18next.t('log.guild_log.message_deleted.embeds', { embeds: message.embeds.length })}`;
				}
				info += `\n${i18next.t('log.guild_log.message_deleted.jump_to', { link: message.url })}`;

				embed = addFields(embed, {
					name: i18next.t('log.guild_log.message_deleted.info'),
					value: info,
				});

				await webhook.send({
					// @ts-ignore
					embeds: [truncateEmbed(embed)],
					username: this.client.user?.username,
					avatarURL: this.client.user?.displayAvatarURL(),
				});
			} catch (e) {
				logger.error(e);
			}

			continue;
		}
	}
}
