import { on } from "node:events";
import { Client, Events, type Message } from "discord.js";
import { injectable } from "tsyringe";
import type { Event } from "../../Event.js";
import { handleAntiSpam } from "../../functions/anti-spam/handler.js";
import { logger } from "../../logger.js";

@injectable()
export default class implements Event {
	public name = "Spam check";

	public event = Events.MessageCreate as const;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		for await (const [message] of on(this.client, this.event) as AsyncIterableIterator<[Message]>) {
			try {
				if (message.author.bot || !message.content.length || !message.inGuild()) {
					continue;
				}

				if (!message.member) {
					continue;
				}

				await handleAntiSpam(message.guildId, message.member.id, message.content, {
					name: this.name,
					event: this.event,
				});
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}

			continue;
		}
	}
}
