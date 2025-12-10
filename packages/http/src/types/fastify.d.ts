import type { API } from "@discordjs/core";
import type HttpHandler from "../index.js";
import type { HttpHandlerOptions } from "./HttpHandlerOptions.js";

declare module "fastify" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface FastifyInstance {
		discord: {
			api: API;
		};
		httpHandler: HttpHandler;
		httpHandlerOptions: HttpHandlerOptions;
	}

	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface FastifyRequest {
		// eslint-disable-next-line n/prefer-global/buffer
		rawBody?: Buffer | string;
	}
}
