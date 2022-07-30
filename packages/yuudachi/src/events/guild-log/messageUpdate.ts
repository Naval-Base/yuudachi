import { on } from 'node:events';
import { diffLines, diffWords } from 'diff';
import { Client, Events, type Message, escapeMarkdown, type Webhook } from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kWebhooks } from '../../tokens.js';
import { addFields, truncateEmbed } from '../../util/embed.js';

@injectable()
export default class implements Event {
	public name = 'Guild log message update';

	public event = Events.MessageUpdate as const;

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

			if (escapeMarkdown(oldMessage.content) === escapeMarkdown(newMessage.content)) {
				continue;
			}

			try {
				const guildLogWebhookId = await getGuildSetting(newMessage.guild.id, SettingsKeys.GuildLogWebhookId);
				const ignoreChannels = await getGuildSetting(newMessage.guild.id, SettingsKeys.LogIgnoreChannels);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);
				if (!webhook) {
					continue;
				}

				if (
					(newMessage.channel.isThread() && ignoreChannels.includes(newMessage.channel.parentId ?? '')) ||
					ignoreChannels.includes(newMessage.channelId)
				) {
					continue;
				}

				const locale = await getGuildSetting(newMessage.guild.id, SettingsKeys.Locale);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: newMessage.guild.id,
						memberId: newMessage.author.id,
					},
					`Member ${newMessage.author.id} updated a message`,
				);

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
						if (part.value === '\n') {
							continue;
						}
						const d = part.added ? '+ ' : part.removed ? '- ' : '';
						description += `${d}${part.value.replace(/\n/g, '')}\n`;
					}

					const prepend = '```diff\n';
					const append = '\n```';
					description = `${prepend}${description.substring(0, 3900)}${append}`;
				} else {
					const diffMessage = diffWords(escapeMarkdown(oldMessage.content), escapeMarkdown(newMessage.content));

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
						footer: { text: newMessage.id },
						timestamp: new Date().toISOString(),
					},
					{
						name: '\u200b',
						value: info,
					},
				);

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
