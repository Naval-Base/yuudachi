import { on } from "node:events";
import { logger, kWebhooks, addFields, truncateEmbed } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { type Client, Events, type ThreadChannel, type Webhook } from "discord.js";
import i18next from "i18next";
import { inject, injectable } from "tsyringe";
import { Color } from "../../Constants.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Guild log thread create";

	public event = Events.ThreadCreate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [thread, newlyCreated] of on(this.client, this.event) as AsyncIterableIterator<
			[ThreadChannel, boolean]
		>) {
			try {
				if (!newlyCreated) {
					continue;
				}

				const guildLogWebhookId = await getGuildSetting(thread.guild.id, SettingsKeys.GuildLogWebhookId);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				const ignoreChannels = await getGuildSetting(thread.guild.id, SettingsKeys.LogIgnoreChannels);

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
						newlyCreated,
						ownerId: thread.ownerId,
					},
					`Thread ${thread.name} created`,
				);

				const descriptionParts = [
					i18next.t("log.guild_log.thread_created.channel", {
						channel: thread.toString(),
						name: `\`${thread.name}\``,
						channel_id: thread.id,
						lng: locale,
					}),
				];

				const starterMessage = await thread.fetchStarterMessage().catch(() => null);

				if (starterMessage) {
					descriptionParts.push(
						i18next.t("log.guild_log.thread_created.starter", {
							message_id: starterMessage.id,
							lng: locale,
						}),
						i18next.t("log.guild_log.thread_created.jump_to", {
							link: starterMessage.url,
							lng: locale,
						}),
					);
				}

				const owner = thread.ownerId ? await this.client.users.fetch(thread.ownerId) : null;
				const embed = addFields({
					author: owner
						? {
								name: `${owner.tag} (${owner.id})`,
								icon_url: owner.displayAvatarURL(),
							}
						: undefined,
					description: descriptionParts.join("\n"),
					title: i18next.t("log.guild_log.thread_created.title"),
					timestamp: (thread.createdAt ?? new Date()).toISOString(),
					color: Color.DiscordGem,
				});

				await webhook.send({
					embeds: [truncateEmbed(embed)],
					username: this.client.user.username,
					avatarURL: this.client.user.displayAvatarURL(),
				});
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}
		}
	}
}
