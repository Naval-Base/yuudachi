import { on } from "node:events";
import { logger, kWebhooks } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type Webhook, PermissionFlagsBits } from "discord.js";
import { inject, injectable } from "tsyringe";
import { getGuildSetting, SettingsKeys } from "../functions/settings/getGuildSetting.js";
import { registerJobs } from "../jobs.js";

@injectable()
export default class implements Event {
	public name = "Client ready handling";

	public event = Events.ClientReady as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kWebhooks) public readonly webhooks: Map<string, Webhook>,
	) {}

	public async execute(): Promise<void> {
		for await (const _ of on(this.client, this.event)) {
			logger.info({ event: { name: this.name, event: this.event } }, "Caching webhooks");
			for (const guild of this.client.guilds.cache.values()) {
				if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks, true)) {
					logger.info(
						{ event: { name: this.name, event: this.event }, guildId: guild.id },
						"No permission to fetch webhooks",
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

			logger.info({ event: { name: this.name, event: this.event } }, "Registering jobs");
			await registerJobs();
		}
	}
}
