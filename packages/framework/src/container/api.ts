import { API } from "@discordjs/core";
import type { REST } from "@discordjs/rest";
import { container } from "tsyringe";

export function createAPI(rest: REST) {
	const api = new API(rest);
	container.register(API, { useValue: api });

	return api;
}
