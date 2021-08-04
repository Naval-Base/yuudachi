import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Client, Constants, Webhook } from 'discord.js';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';

import type { Event } from '../Event';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting';
import { registerJobs, startJobs } from '../jobs';
import { logger } from '../logger';
import { kWebhooks } from '../tokens';

@injectable()
export default class implements Event {
	public name = 'Client ready handling';

	public event = Constants.Events.CLIENT_READY;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for await (const _ of on(this.client, this.event) as AsyncIterableIterator<[void]>) {
			logger.info({ event: { name: this.name, event: this.event } }, 'Caching webhooks');
			for (const guild of this.client.guilds.cache.values()) {
				if (!guild.me?.permissions.has(PermissionFlagsBits.ManageWebhooks, true)) {
					logger.info(
						{ event: { name: this.name, event: this.event }, guildId: guild.id },
						'No permission to fetch webhooks',
					);
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

			logger.info({ event: { name: this.name, event: this.event } }, 'Registering jobs');
			registerJobs();
			logger.info({ event: { name: this.name, event: this.event } }, 'Starting jobs');
			startJobs();

			continue;
		}
	}
}
