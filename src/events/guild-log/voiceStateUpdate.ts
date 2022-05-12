import { on } from 'node:events';
import { Client, Events, type VoiceState, type Webhook } from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { addFields, truncateEmbed } from '../../util/embed';

@injectable()
export default class implements Event {
	public name = 'Guild log voice state update';

	public event = Events.VoiceStateUpdate;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [oldState, newState] of on(this.client, this.event) as AsyncIterableIterator<
			[VoiceState | null, VoiceState]
		>) {
			if (!newState.member || !newState.channelId) {
				continue;
			}
			if (oldState?.member?.user.bot || newState.member.user.bot) {
				continue;
			}

			try {
				const locale = (await getGuildSetting(newState.guild.id, SettingsKeys.Locale)) as string;
				const logChannelId = (await getGuildSetting(newState.guild.id, SettingsKeys.GuildLogWebhookId)) as string;
				const ignoreChannels = (await getGuildSetting(newState.guild.id, SettingsKeys.LogIgnoreChannels)) as string;

				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				let description = '';
				if ((!oldState || !oldState.channel || ignoreChannels.includes(oldState.channelId ?? '')) && newState.channel) {
					if (ignoreChannels.includes(newState.channelId)) {
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

					description = i18next.t('log.guild_log.voice_state_update.joined', {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: newState.channel.toString(),
						lng: locale,
					});
				} else if (oldState?.channel && (!newState.channel || ignoreChannels.includes(newState.channelId))) {
					logger.info(
						{
							event: { name: this.name, event: this.event },
							guildId: newState.guild.id,
							memberId: newState.member.id,
							channelId: oldState.channel.id,
							joined: false,
						},
						`Member ${newState.member.id} left a voice channel`,
					);

					description = i18next.t('log.guild_log.voice_state_update.left', {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						channel: oldState.channel.toString(),
						lng: locale,
					});
				} else if (oldState?.channel && newState.channel && oldState.channelId !== newState.channelId) {
					description = i18next.t('log.guild_log.voice_state_update.moved', {
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						fromChannel: oldState.channel.toString(),
						// eslint-disable-next-line @typescript-eslint/no-base-to-string
						toChannel: newState.channel.toString(),
						lng: locale,
					});
				} else {
					continue;
				}

				const embed = addFields({
					author: {
						name: `${newState.member.user.tag} (${newState.member.id})`,
						icon_url: newState.member.user.displayAvatarURL(),
					},
					color: 3407871,
					title: i18next.t('log.guild_log.voice_state_update.title', { lng: locale }),
					description,
					timestamp: new Date().toISOString(),
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
