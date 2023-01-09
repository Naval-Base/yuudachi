import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { fastify } from "fastify";
import InteractionsRoute from "./routes/interactions.js";
import type { HttpHandlerOptions } from "./types/index.js";

export default class HttpHandler {
	#_fastify = fastify(this.options.fastifyOptions);

	public get log() {
		return this.#_fastify.log;
	}

	public constructor(public readonly options: HttpHandlerOptions) {}

	public async listen(port: number) {
		await this.#_fastify.register(helmet);
		await this.#_fastify.register(sensible);

		this.#_fastify.decorate("httpHandlerOptions", this.options);
		this.#_fastify.decorate("discord", { api: this.options.api });

		await this.#_fastify.register(InteractionsRoute);

		await this.#_fastify.listen({ port });
	}
}
