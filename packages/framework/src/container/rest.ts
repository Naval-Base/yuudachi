import { REST, type RESTOptions } from "@discordjs/rest";
import { container } from "tsyringe";

export function createREST(options?: Partial<RESTOptions>) {
	// eslint-disable-next-line no-restricted-globals, n/prefer-global/process
	const rest = new REST(options).setToken(process.env.DISCORD_TOKEN!);
	container.register(REST, { useValue: rest });

	return rest;
}
