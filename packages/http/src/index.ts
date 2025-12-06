import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { fastify, type FastifyInstance } from "fastify";
import InteractionsRoute from "./routes/interactions.js";
import type { HttpHandlerOptions } from "./types/index.js";

export default class HttpHandler {
	readonly #_fastify: FastifyInstance;

	public get log() {
		return this.#_fastify.log;
	}

	public constructor(public readonly options: HttpHandlerOptions) {
		this.#_fastify = fastify(this.options.fastifyOptions);
	}

	public async listen(port: number) {
		await this.#_fastify.register(helmet);
		await this.#_fastify.register(sensible);

		this.#_fastify.decorate("httpHandlerOptions", this.options);
		this.#_fastify.decorate("discord", { api: this.options.api });

		await this.#_fastify.register(InteractionsRoute);

		await this.#_fastify.listen({ port });
	}
}
