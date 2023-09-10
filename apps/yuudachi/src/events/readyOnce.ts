import { once } from "node:events";
import { createServer } from "node:http";
import { URL } from "node:url";
import { logger } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, Events } from "discord.js";
import { Gauge, collectDefaultMetrics, register } from "prom-client";
import { container, injectable } from "tsyringe";

collectDefaultMetrics({ register, prefix: "yuudachi_bot_v3_" });

new Gauge({
	name: "yuudachi_bot_v3_guilds_total",
	help: "Total guilds",
	collect() {
		const client = container.resolve<Client<true>>(Client);

		this.set(client.guilds.cache.size);
	},
});

new Gauge({
	name: "yuudachi_bot_v3_members_total",
	help: "Total users",
	labelNames: ["guildId"],
	collect() {
		const client = container.resolve<Client<true>>(Client);

		for (const [, guild] of client.guilds.cache) {
			this.set({ guildId: guild.id }, guild.memberCount);
		}
	},
});

@injectable()
export default class implements Event {
	public name = "Client ready once handling";

	public event = Events.ClientReady as const;

	public constructor(public readonly client: Client<true>) {}

	public async execute(): Promise<void> {
		await once(this.client, this.event);

		logger.info(
			{ event: { name: this.name, event: this.event } },
			"Settings up /metrics endpoint for prometheus scraping",
		);

		const server = createServer(async (req, res) => {
			const route = new URL(req.url!, "http://noop").pathname;

			if (route === "/metrics") {
				logger.info({ event: { name: this.name, event: this.event } }, "Scraping /metrics request");

				res.setHeader("content-type", register.contentType);
				res.end(await register.metrics());
			}
		});
		server.listen(8_787);
	}
}
