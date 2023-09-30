import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import { container, kSQL } from "@yuudachi/framework";
import { Client } from "discord.js";
import { fastify } from "fastify";
import type { Sql } from "postgres";
import type { RawCase } from "../functions/cases/transformCase.js";

export const api = fastify({ trustProxy: true })
	.register(helmet)
	.register(sensible)
	.register(
		(app, _, done) => {
			app.get("/", () => "Welcome to the yuudachi api.");
			app.get("/users/:id", async (request) => {
				const client = container.resolve(Client);
				const { id } = request.params as any;

				const user = await client.users.fetch(id);
				console.log(user);
				return user;
			});
			app.get("/cases", async () => {
				const sql = container.resolve<Sql<any>>(kSQL);

				return sql<RawCase[]>`
					select *
					from cases
					where guild_id = '222078108977594368'
						and target_id = '492374435274162177'
						and action not in (1, 8)
					order by created_at desc
					limit 50
				`;
			});

			done();
		},
		{ prefix: "/api" },
	);
