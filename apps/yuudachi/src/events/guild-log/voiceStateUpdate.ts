import { on } from "node:events";
import { logger, kWebhooks, truncateEmbed, addFields } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type VoiceState, type Webhook, type APIEmbedAuthor } from "discord.js";
import i18next from "i18next";
import { inject, injectable } from "tsyringe";
import { Color } from "../../Constants.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";

@injectable()
export default class implements Event {
	public name = "Guild log voice state update";

	public event = Events.VoiceStateUpdate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [oldState, newState] of on(this.client, this.event) as AsyncIterableIterator<
			[VoiceState | null, VoiceState]
		>) {
			if (oldState?.member?.user.bot || newState.member?.user.bot) {
				continue;
			}

			try {
				const guildLogWebhookId = await getGuildSetting(newState.guild.id, SettingsKeys.GuildLogWebhookId);

				if (!guildLogWebhookId) {
					continue;
				}

				const webhook = this.webhooks.get(guildLogWebhookId);

				if (!webhook) {
					continue;
				}

				const ignoreChannels = await getGuildSetting(newState.guild.id, SettingsKeys.LogIgnoreChannels);

				const locale = await getGuildSetting(newState.guild.id, SettingsKeys.Locale);

				const fromIgnored = oldState?.channelId ? ignoreChannels.includes(oldState.channelId) : false;
				const toIgnored = newState?.channelId ? ignoreChannels.includes(newState.channelId) : false;

				let description = "";
				let author: APIEmbedAuthor;

				if ((!oldState?.channel || fromIgnored) && newState.channel) {
					if (!newState.member || toIgnored) {
						continue;
					}

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: newState.guild.id,
							memberId: newState.member.id,
							channelId: newState.channel.id,
							joined: true,
						},
						`Member ${newState.member.id} joined a voice channel`,
					);

					description = i18next.t("log.guild_log.voice_state_update.joined", {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: `${newState.channel.toString()} - ${newState.channel.name} (${newState.channel.id})`,
						lng: locale,
					});
					author = {
						name: `${newState.member.user.tag} (${newState.member.id})`,
						icon_url: newState.member.user.displayAvatarURL(),
					};
				} else if (oldState?.channel && (!newState.channel || toIgnored)) {
					if (!oldState.member || fromIgnored) {
						continue;
					}

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: oldState.guild.id,
							memberId: oldState.member.id,
							channelId: oldState.channel.id,
							joined: false,
						},
						`Member ${oldState.member.id} left a voice channel`,
					);

					description = i18next.t("log.guild_log.voice_state_update.left", {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: `${oldState.channel.toString()} - ${oldState.channel.name} (${oldState.channel.id})`,
						lng: locale,
					});
					author = {
						name: `${oldState.member.user.tag} (${oldState.member.id})`,
						icon_url: oldState.member.user.displayAvatarURL(),
					};
				} else if (oldState?.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
					if (!newState.member) {
						return;
					}

					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: newState.guild.id,
							memberId: newState.member.id,
							channelIdOld: oldState.channel.id,
							channelIdNew: newState.channel.id,
							joined: true,
						},
						`Member ${newState.member.id} left a voice channel`,
					);

					description = i18next.t("log.guild_log.voice_state_update.moved", {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						from_channel: `${oldState.channel.toString()} - ${oldState.channel.name} (${oldState.channel.id})`,
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						to_channel: `${newState.channel.toString()} - ${newState.channel.name} (${newState.channel.id})`,
						lng: locale,
					});
					author = {
						name: `${newState.member.user.tag} (${newState.member.id})`,
						icon_url: newState.member.user.displayAvatarURL(),
					};
				} else {
					continue;
				}

				const embed = addFields({
					description,
					author,
					color: Color.DiscordPrimary,
					title: i18next.t("log.guild_log.voice_state_update.title", { lng: locale }),
					timestamp: new Date().toISOString(),
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
