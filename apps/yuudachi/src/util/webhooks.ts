import { kWebhooks, container } from "@yuudachi/framework";
import type { Webhook } from "discord.js";

export function createWebhooks() {
	const webhooks = new Map<string, Webhook>();
	container.register(kWebhooks, { useValue: webhooks });

	return webhooks;
}
