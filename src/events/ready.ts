import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Client, Constants, Webhook } from 'discord.js';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../Event';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting';
import { kWebhooks } from '../tokens';

@injectable()
export default class implements Event {
	public name = 'Client ready handling';

	public event = Constants.Events.CLIENT_READY;

	public constructor(
		public readonly client: Client,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for await (const _ of on(this.client, this.event) as AsyncIterableIterator<[void]>) {
			for (const guild of this.client.guilds.cache.values()) {
				if (!guild.me?.permissions.has(PermissionFlagsBits.ManageWebhooks, true)) {
					continue;
				}

				const memberLogWebhookId = await getGuildSetting(guild.id, SettingsKeys.MemberLogWebhookId);
				const guildLogWebhookId = await getGuildSetting(guild.id, SettingsKeys.GuildLogWebhookId);

				const webhooks = await guild.fetchWebhooks();

				if (memberLogWebhookId) {
					const webhook = webhooks.get(memberLogWebhookId);
					if (!webhook) {
						continue;
					}
					this.webhooks.set(webhook.id, webhook);
				}

				if (guildLogWebhookId) {
					const webhook = webhooks.get(guildLogWebhookId);
					if (!webhook) {
						continue;
					}
					this.webhooks.set(webhook.id, webhook);
				}
			}

			continue;
		}
	}
}
