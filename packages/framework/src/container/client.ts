import { Client, type ClientOptions } from "discord.js";
import { container } from "tsyringe";

export function createClient(options: ClientOptions) {
	const client = new Client(options);
	client.setMaxListeners(20);
	container.register(Client, { useValue: client });

	return client;
}
