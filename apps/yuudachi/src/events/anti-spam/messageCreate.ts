import { on } from "node:events";
import { inject, injectable } from "@needle-di/core";
import { logger } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events, type Message } from "discord.js";
import { handleAntiSpam } from "../../functions/anti-spam/handler.js";

@injectable()
export default class implements Event {
	public name = "Spam check";

	public event = Events.MessageCreate as const;

	public constructor(public readonly client: Client<true> = inject(Client)) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (message.author.bot || !message.inGuild()) {
					continue;
				}

				if (!message.member) {
					continue;
				}

				const hasContent = message.content.length > 0;
				const hasAttachments = message.attachments.size > 0;

				if (!hasContent && !hasAttachments) {
					continue;
				}

				await handleAntiSpam(
					message.guildId,
					message.member.id,
					message.content ?? "",
					{
						name: this.name,
						event: this.event,
					},
					[...message.attachments.values()],
				);
			} catch (error) {
				const error_ = error as Error;
				logger.error(error_, error_.message);
			}
		}
	}
}
