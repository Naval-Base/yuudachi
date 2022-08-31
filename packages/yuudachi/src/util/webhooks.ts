import type { Webhook } from "discord.js";
import { container } from "tsyringe";
import { kWebhooks } from "../tokens.js";

export function createWebhooks() {
	const webhooks = new Map<string, Webhook>();
	container.register(kWebhooks, { useValue: webhooks });

	return webhooks;
}
