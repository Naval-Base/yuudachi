import type { API } from "@discordjs/core";
import type { FastifyServerOptions } from "fastify";
import type { InteractionsCallback } from "./InteractionsCallback.js";

export type HttpHandlerOptions = {
	api: API;
	fastifyOptions?: FastifyServerOptions;
	interactionsCallback: InteractionsCallback;
	interactionsRoute?: string;
};
