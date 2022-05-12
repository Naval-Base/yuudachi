import { on } from 'node:events';
import { Client, Events, type GuildMember, type Webhook } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../../Event';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import { logger } from '../../logger';
import { kWebhooks } from '../../tokens';
import { generateMemberLog } from '../../util/generateMemberLog';

@injectable()
export default class implements Event {
	public name = 'Member log add';

	public event = Events.GuildMemberAdd;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const [guildMember] of on(this.client, this.event) as AsyncIterableIterator<[GuildMember]>) {
			try {
				logger.info(
					{ event: { name: this.name, event: this.event }, guildId: guildMember.guild.id, memberId: guildMember.id },
					`Member ${guildMember.id} joined`,
				);

				const locale = (await getGuildSetting(guildMember.guild.id, SettingsKeys.Locale)) as string;
				const logChannelId = (await getGuildSetting(guildMember.guild.id, SettingsKeys.MemberLogWebhookId)) as string;
				if (!logChannelId) {
					continue;
				}
				const webhook = this.webhooks.get(logChannelId);
				if (!webhook) {
					continue;
				}

				await webhook.send({
					embeds: [generateMemberLog(guildMember, locale)],
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
