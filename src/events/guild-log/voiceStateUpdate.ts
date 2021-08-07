import { Client, Constants, VoiceState, Webhook } from 'discord.js';
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
	public name = 'Guild log voice state update';

	public event = Constants.Events.VOICE_STATE_UPDATE;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [oldState, newState] of on(this.client, this.event) as AsyncIterableIterator<
			[VoiceState | null, VoiceState]
		>) {
			if (!newState.member) {
				continue;
			}
			if (oldState?.member?.user.bot || newState.member.user.bot) {
				continue;
			}

			try {
				const locale = await getGuildSetting(newState.guild.id, SettingsKeys.Locale);
				const logChannelId = await getGuildSetting(newState.guild.id, SettingsKeys.GuildLogWebhookId);
				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				let description = '';
				if ((!oldState || !oldState.channel) && newState.channel) {
					description = i18next.t('log.guild_log.voice_state_update.joined', {
						channel: newState.channel.toString(),
						lng: locale,
					});
				} else if (oldState?.channel && newState.channel && oldState.channelId !== newState.channelId) {
					description = i18next.t('log.guild_log.voice_state_update.moved', {
						fromChannel: oldState.channel.toString(),
						toChannel: newState.channel.toString(),
						lng: locale,
					});
				} else if (oldState?.channel && !newState.channel) {
					description = i18next.t('log.guild_log.voice_state_update.left', {
						channel: oldState.channel.toString(),
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
