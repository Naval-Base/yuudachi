import process from "node:process";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import { container, kSQL } from "@yuudachi/framework";
import { Client } from "discord.js";
import { fastify } from "fastify";
import type { Sql } from "postgres";
import { CaseAction } from "../functions/cases/createCase.js";
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

			app.get("/users/:id", async (request) => {
				const { id } = request.params as any;
				const client = container.resolve(Client);
				const sql = container.resolve<Sql<any>>(kSQL);

				let banned = false;

				try {
					await client.guilds.cache.get("222078108977594368")!.bans.fetch(id);
					banned = true;
				} catch {
					banned = false;
				}

				if (banned) {
					const user = await client.users.fetch(id, { force: true });
					const [case_] = await sql<[RawCase]>`
						select *
						from cases
						where guild_id = '222078108977594368'
							and target_id = ${id}
							and action = ${CaseAction.Ban}
						order by created_at desc
						limit 1
					`;
					const moderator = await client.users.fetch(case_.mod_id, { force: true });

					return { user, moderator, banned, case: case_ };
				}

				return { banned };
			});

			app.get("/cases", async (_) => {
				const sql = container.resolve<Sql<any>>(kSQL);

				const cases = await sql<RawCase[]>`
					select target_id, target_tag, count(target_id) case_count
					from cases
					where guild_id = '222078108977594368'
						and action not in (1, 8)
					group by target_id, target_tag
					order by max(created_at) desc
					limit 50
				`;

				return { cases };
			});

			app.get("/cases/:id", async (request) => {
				const { id } = request.params as any;
				const client = container.resolve(Client);
				const sql = container.resolve<Sql<any>>(kSQL);

				const user = await client.users.fetch(id, { force: true });
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
