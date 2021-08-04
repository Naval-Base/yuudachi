import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { Client, Collection, Constants, Message, Snowflake, Webhook } from 'discord.js';
import i18next from 'i18next';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';

dayjs.extend(relativeTime);
dayjs.extend(utc);

import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { addFields, truncateEmbed } from '../../util/embed';

const DATE_FORMAT_WITH_SECONDS = 'YYYY/MM/DD HH:mm:ss';

@injectable()
export default class implements Event {
	public name = 'Guild log message bulk delete';

	public event = Constants.Events.MESSAGE_BULK_DELETE;

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
			if (messages.first()!.author.bot) {
				continue;
			}
			if (!messages.first()!.guild) {
				continue;
			}

			try {
				const locale = await getGuildSetting(messages.first()!.guild!.id, SettingsKeys.Locale);
				const logChannelId = await getGuildSetting(messages.first()!.guild!.id, SettingsKeys.GuildLogWebhookId);
				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				const output = messages.reduce((out, msg) => {
					const attachments = msg.attachments;
					out += `[${dayjs(msg.createdTimestamp).utc().format(DATE_FORMAT_WITH_SECONDS)} (UTC)] ${msg.author.tag} (${
						msg.author.id
					}): ${msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''}${
						attachments.size
							? `\r\n${attachments.map((attachment) => `❯ Attachment: ${attachment.proxyURL}`).join('\r\n')}`
							: ''
					}\r\n`;
					return out;
				}, '');

				const embed = addFields({
					author: {
						name: `${messages.first()!.author.tag} (${messages.first()!.author.id})`,
						icon_url: messages.first()!.author.displayAvatarURL(),
					},
					color: 3092790,
					title: i18next.t('log.guild_log.message_bulk_deleted.title', { lng: locale }),
					description: i18next.t('log.guild_log.message_bulk_deleted.description', {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: messages.first()!.channel.toString(),
						lng: locale,
					}),
					timestamp: new Date().toISOString(),
				});

				await webhook.send({
					// @ts-ignore
					embeds: [truncateEmbed(embed)],
					files: [{ attachment: Buffer.from(output, 'utf-8'), name: 'logs.txt' }],
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
