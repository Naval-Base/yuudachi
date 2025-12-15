import { logger, kRedis, kSQL, container } from "@yuudachi/framework";
import { type Job, Queue, Worker } from "bullmq";
import { Client, type Snowflake } from "discord.js";
import type { Redis } from "ioredis";
import type { Sql } from "postgres";
import { refreshScamDomains } from "./functions/anti-scam/refreshScamDomains.js";
import { deleteCase } from "./functions/cases/deleteCase.js";
import { deleteLockdown } from "./functions/lockdowns/deleteLockdown.js";
import { upsertCaseLog } from "./functions/logging/upsertCaseLog.js";

export async function registerJobs() {
	const client = container.get<Client<true>>(Client);
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	const sql = container.get<Sql<{}>>(kSQL);
	const redis = container.get<Redis>(kRedis);

	const queue = new Queue("jobs", { connection: redis });

	try {
		logger.info(
			{
				job: { name: "modActionTimers" },
			},
			"Registering job: modActionTimers",
		);
		await queue.add("modActionTimers", {}, { repeat: { pattern: "* * * * *" } });
		logger.info(
			{
				job: { name: "modActionTimers" },
			},
			"Registered job: modActionTimers",
		);

		logger.info(
			{
				job: { name: "modLockdownTimers" },
			},
			"Registering job: modLockdownTimers",
		);
		await queue.add("modLockdownTimers", {}, { repeat: { pattern: "* * * * *" } });
		logger.info(
			{
				job: { name: "modLockdownTimers" },
			},
			"Registered job: modLockdownTimers",
		);

		logger.info(
			{
				job: { name: "scamDomainUpdateTimers" },
			},
			"Registering job: scamDomainUpdateTimers",
		);
		await queue.add("scamDomainUpdateTimers", {}, { repeat: { pattern: "*/5 * * * *" } });
		logger.info(
			{
				job: { name: "scamDomainUpdateTimers" },
			},
			"Registered job: scamDomainUpdateTimers",
		);

		new Worker(
			"jobs",
			async (job: Job) => {
				switch (job.name) {
					case "modActionTimers": {
						const currentCases = await sql<[{ action_expiration: string; case_id: number; guild_id: Snowflake }]>`
							select guild_id, case_id, action_expiration
							from cases
							where action_processed = false
						`;

						for (const case_ of currentCases) {
							if (Date.parse(case_.action_expiration) <= Date.now()) {
								const guild = client.guilds.resolve(case_.guild_id);

								if (!guild) {
									continue;
								}

								try {
									const newCase = await deleteCase({ guild, user: client.user, caseId: case_.case_id });
									await upsertCaseLog(guild, client.user, newCase);
								} catch (error_) {
									const error = error_ as Error;
									logger.error(error, error.message);
								}
							}
						}

						break;
					}

					case "modLockdownTimers": {
						const currentLockdowns = await sql<[{ channel_id: Snowflake; expiration: string }]>`
							select channel_id, expiration
							from lockdowns
						`;

						for (const lockdown of currentLockdowns) {
							if (Date.parse(lockdown.expiration) <= Date.now()) {
								try {
									await deleteLockdown(lockdown.channel_id);
								} catch (error_) {
									const error = error_ as Error;
									logger.error(error, error.message);
								}
							}
						}

						break;
					}

					case "scamDomainUpdateTimers": {
						try {
							await refreshScamDomains();
						} catch (error_) {
							const error = error_ as Error;
							logger.error(error, error.message);
						}

						break;
					}

					default:
						break;
				}
			},
			{ connection: redis },
		);
	} catch (error_) {
		const error = error_ as Error;
		logger.error(error, error.message);
	}
}
