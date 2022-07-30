import { on } from 'node:events';
import { type APIEmbed, Client, Events, type ThreadChannel, type Webhook } from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import { logger } from '../../logger.js';
import { kWebhooks } from '../../tokens.js';
import { truncateEmbed } from '../../util/embed.js';

@injectable()
export default class implements Event {
	public name = 'Guild log thread create';

	public event = Events.ThreadDelete as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [thread] of on(this.client, this.event) as AsyncIterableIterator<[ThreadChannel, boolean]>) {
			try {
				const guildLogWebhookId = await getGuildSetting(thread.guild.id, SettingsKeys.GuildLogWebhookId);
				const ignoreChannels = await getGuildSetting(thread.guild.id, SettingsKeys.LogIgnoreChannels);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				if (
					ignoreChannels.includes(thread.id) ||
					(thread.parentId && ignoreChannels.includes(thread.parentId)) ||
					(thread.parent?.parentId && ignoreChannels.includes(thread.parent.parentId))
				) {
					continue;
				}

				const locale = await getGuildSetting(thread.guild.id, SettingsKeys.Locale);

				logger.info(
					{
						event: { name: this.name, event: this.event },
						guildId: thread.guild.id,
						threadId: thread.id,
						ownerId: thread.ownerId,
					},
					`Thread ${thread.name} deleted`,
				);

				const descriptionParts = [
					i18next.t('log.guild_log.thread_deleted.channel', {
						name: `\`${thread.name}\``,
						channel_id: thread.id,
						lng: locale,
					}),
				];

				const starterMessage = await thread.fetchStarterMessage().catch(() => null);

				if (starterMessage) {
					descriptionParts.push(
						i18next.t('log.guild_log.thread_deleted.starter', {
							message_id: starterMessage.id,
							lng: locale,
						}),
						i18next.t('log.guild_log.thread_deleted.jump_to', {
							link: starterMessage.url,
							lng: locale,
						}),
					);
				}

				const owner = thread.ownerId ? await this.client.users.fetch(thread.ownerId) : null;
				const embed: APIEmbed = {
					author: owner
						? {
								name: `${owner.tag} (${owner.id})`,
								icon_url: owner.displayAvatarURL(),
						  }
						: undefined,
					description: descriptionParts.join('\n'),
					title: i18next.t('log.guild_log.thread_deleted.title'),
					timestamp: (thread.createdAt ?? new Date()).toISOString(),
					color: 15896915,
				};

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
