import { API } from "@discordjs/core";
import type { REST } from "@discordjs/rest";
import { container } from "./container.js";

export function createAPI(rest: REST) {
	const api = new API(rest);
	container.bind({ provide: API, useValue: api });

	return api;
}
