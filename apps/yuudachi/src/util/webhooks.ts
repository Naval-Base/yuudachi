import { kWebhooks, container } from "@yuudachi/framework";
import type { Webhook } from "discord.js";

export function createWebhooks() {
	const webhooks = new Map<string, Webhook>();
	container.bind({ provide: kWebhooks, useValue: webhooks });

	return webhooks;
}
