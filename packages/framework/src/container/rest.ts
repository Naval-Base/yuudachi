import process from "node:process";
import { REST, type RESTOptions } from "@discordjs/rest";
import { container } from "tsyringe";

export function createREST(options?: Partial<RESTOptions>) {
	const rest = new REST(options).setToken(process.env.DISCORD_TOKEN!);
	container.register(REST, { useValue: rest });

	return rest;
}
