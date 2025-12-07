import { Client, type ClientOptions } from "discord.js";
import { container } from "./container.js";

export function createClient(options: ClientOptions) {
	const client = new Client(options);
	client.setMaxListeners(20);
	container.bind({ provide: Client, useValue: client });

	return client;
}
