import { Client, Constants, Message, Util, Webhook } from 'discord.js';
import i18next from 'i18next';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';
import { diffLines, diffWords } from 'diff';

import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { addFields, truncateEmbed } from '../../util/embed';

@injectable()
export default class implements Event {
	public name = 'Guild log message update';

	public event = Constants.Events.MESSAGE_UPDATE;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [oldMessage, newMessage] of on(this.client, this.event) as AsyncIterableIterator<
			[Message, Message]
		>) {
			if (newMessage.author.bot) {
				continue;
			}
			if (!newMessage.guild) {
				continue;
			}
			if (Util.escapeMarkdown(oldMessage.content) === Util.escapeMarkdown(newMessage.content)) {
				continue;
			}

			try {
				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: newMessage.guild.id,
						memberId: newMessage.author.id,
					},
					`Member ${newMessage.author.id} updated a message`,
				);

				const locale = await getGuildSetting(newMessage.guild.id, SettingsKeys.Locale);
				const logChannelId = await getGuildSetting(newMessage.guild.id, SettingsKeys.GuildLogWebhookId);
				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				let description = '';
				if (/```(.*?)```/s.test(oldMessage.content) && /```(.*?)```/s.test(newMessage.content)) {
					const strippedOldMessage = /```(?:(\S+)\n)?\s*([^]+?)\s*```/.exec(oldMessage.content);
					if (!strippedOldMessage || !strippedOldMessage[2]) {
						continue;
					}

					const strippedNewMessage = /```(?:(\S+)\n)?\s*([^]+?)\s*```/.exec(newMessage.content);
					if (!strippedNewMessage || !strippedNewMessage[2]) {
						continue;
					}
					if (strippedOldMessage[2] === strippedNewMessage[2]) {
						continue;
					}

					const diffMessage = diffLines(strippedOldMessage[2], strippedNewMessage[2], { newlineIsToken: true });

					for (const part of diffMessage) {
						if (part.value === '\n') continue;
						const d = part.added ? '+ ' : part.removed ? '- ' : '';
						description += `${d}${part.value.replace(/\n/g, '')}\n`;
					}

					const prepend = '```diff\n';
					const append = '\n```';
					description = `${prepend}${description.substring(0, 3900)}${append}`;
				} else {
					const diffMessage = diffWords(
						Util.escapeMarkdown(oldMessage.content),
						Util.escapeMarkdown(newMessage.content),
					);

					for (const part of diffMessage) {
						const markdown = part.added ? '**' : part.removed ? '~~' : '';
						description += `${markdown}${part.value}${markdown}`;
					}

					description = `${description.substring(0, 3900)}` || '\u200b';
				}

				const info = `${i18next.t('log.guild_log.message_updated.channel', {
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					channel: newMessage.channel.toString(),
					lng: locale,
				})}\n${i18next.t('log.guild_log.message_updated.jump_to', { link: newMessage.url, lng: locale })}`;
				const embed = addFields(
					{
						author: {
							name: `${newMessage.author.tag} (${newMessage.author.id})`,
							icon_url: newMessage.author.displayAvatarURL(),
						},
						color: 6057215,
						title: i18next.t('log.guild_log.message_updated.title', { lng: locale }),
						description,
						footer: i18next.t('log.guild_log.message_updated.footer', { id: newMessage.id, lng: locale }),
						timestamp: new Date().toISOString(),
					},
					{
						name: i18next.t('log.guild_log.message_updated.info', { lng: locale }),
						value: info,
					},
				);

				await webhook.send({
					// @ts-ignore
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
