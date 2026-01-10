import { REST, type RESTOptions } from "@discordjs/rest";
import { container } from "./container.js";

export function createREST(options?: Partial<RESTOptions>) {
	const rest = new REST(options).setToken(process.env.DISCORD_TOKEN!);
	container.bind({ provide: REST, useValue: rest });

	return rest;
}
