import type { API } from "@discordjs/core";
import type HttpHandler from "../index.js";
import type { HttpHandlerOptions } from "./HttpHandlerOptions.js";

declare module "fastify" {
	interface FastifyInstance {
		discord: {
			api: API;
		};
		httpHandler: HttpHandler;
		httpHandlerOptions: HttpHandlerOptions;
	}

	interface FastifyRequest {
		rawBody?: Buffer | string;
	}
}
