import { on } from 'node:events';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Client, Events, type Webhook } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Event } from '../Event.js';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting.js';
import { registerJobs, startJobs } from '../jobs.js';
import { logger } from '../logger.js';
import { kWebhooks } from '../tokens.js';

@injectable()
export default class implements Event {
	public name = 'Client ready handling';

	public event = Events.ClientReady as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const _ of on(this.client, this.event) as AsyncIterableIterator<[void]>) {
			logger.info({ event: { name: this.name, event: this.event } }, 'Caching webhooks');
			for (const guild of this.client.guilds.cache.values()) {
				if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks, true)) {
					logger.info(
						{ event: { name: this.name, event: this.event }, guildId: guild.id },
						'No permission to fetch webhooks',
					);
					continue;
				}

				const memberLogWebhookId = (await getGuildSetting(guild.id, SettingsKeys.MemberLogWebhookId)) as string;
				const guildLogWebhookId = (await getGuildSetting(guild.id, SettingsKeys.GuildLogWebhookId)) as string;

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
			await registerJobs();
			logger.info({ event: { name: this.name, event: this.event } }, 'Starting jobs');
			await startJobs();

			continue;
		}
	}
}
