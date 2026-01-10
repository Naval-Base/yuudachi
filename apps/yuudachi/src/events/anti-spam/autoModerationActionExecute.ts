import { on } from "node:events";
import { inject, injectable } from "@needle-di/core";
import { logger } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import type { AutoModerationActionExecution } from "discord.js";
import { Client, AutoModerationActionType, Events } from "discord.js";
import { handleAntiSpam } from "../../functions/anti-spam/handler.js";

@injectable()
export default class implements Event {
	public name = "AutoMod spam handler";

	public event = Events.AutoModerationActionExecution as const;

	public constructor(public readonly client: Client<true> = inject(Client)) {}

	public async execute(): Promise<void> {
		for await (const [autoModAction] of on(this.client, this.event) as AsyncIterableIterator<
			[AutoModerationActionExecution]
		>) {
			try {
				if (autoModAction.action.type !== AutoModerationActionType.BlockMessage) {
					continue;
				}

				if (!autoModAction.content.length) {
					continue;
				}

				await handleAntiSpam(autoModAction.guild.id, autoModAction.userId, autoModAction.content, {
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
