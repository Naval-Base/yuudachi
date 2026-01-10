import { on } from "node:events";
import { inject, injectable } from "@needle-di/core";
import { logger } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type Message } from "discord.js";
import { handleInteractionSpam } from "../../functions/anti-spam/handler.js";

@injectable()
export default class implements Event {
	public name = "Spam check (interaction)";

	public event = Events.MessageCreate as const;

	public constructor(public readonly client: Client<true> = inject(Client)) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (!message.author.bot || !message.inGuild()) {
					continue;
				}

				const metadata = message.interactionMetadata;

				if (!metadata) {
					continue;
				}

				const executor = metadata.user;
				const userIntegrationOwnerId = metadata.authorizingIntegrationOwners?.[0];

				// We only want user-installed apps acting on behalf of the executing user.
				if (!userIntegrationOwnerId || userIntegrationOwnerId !== executor.id) {
					continue;
				}

				await handleInteractionSpam(message.guildId, executor.id, {
					name: this.name,
					event: this.event,
				});
			} catch (error) {
				const error_ = error as Error;
				logger.error(error_, error_.message);
			}
		}
	}
}
