import { Client, Constants, GuildMember, Webhook } from 'discord.js';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { generateMemberLog } from '../../util/generateMemberLog';

@injectable()
export default class implements Event {
	public name = 'Member log add';

	public event = Constants.Events.GUILD_MEMBER_ADD;

	public constructor(
		public readonly client: Client,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				const logChannelId = await getGuildSetting(guildMember.guild.id, SettingsKeys.MemberLogWebhookId);
				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				await webhook.send({
					// @ts-ignore
					embeds: [generateMemberLog(guildMember)],
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
