import process from "node:process";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import { container, kSQL } from "@yuudachi/framework";
import { Client } from "discord.js";
import { fastify } from "fastify";
import type { Sql } from "postgres";
import type { RawCase } from "../functions/cases/transformCase.js";

export const api = fastify({ trustProxy: true })
	.register(helmet)
	.register(sensible)
	.register(jwt, { secret: process.env.API_JWT_SECRET! })
	.addHook("onRequest", async (request, reply) => {
		try {
			await request.jwtVerify();
		} catch (error) {
			reply.send(error);
		}
	})
	.register(
		(app, _, done) => {
			app.get("/", () => "Welcome to the yuudachi api.");
			app.get("/cases/:id", async (request) => {
				const { id } = request.params as any;
				const client = container.resolve(Client);
				const sql = container.resolve<Sql<any>>(kSQL);

				const user = await client.users.fetch(id);
				const cases = await sql<RawCase[]>`
					select *
					from cases
					where guild_id = '222078108977594368'
						and target_id = ${id}
						and action not in (1, 8)
					order by created_at desc
					limit 50
				`;

				return { user, cases };
			});

			done();
		},
		{ prefix: "/api" },
	);
