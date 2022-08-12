import { fileURLToPath, URL } from 'node:url';
import type Bree from 'bree';
import { Client, type Snowflake } from 'discord.js';
import { container } from 'tsyringe';
import { JobType } from './Constants.js';
import { deleteCase } from './functions/cases/deleteCase.js';
import { deleteLockdown } from './functions/lockdowns/deleteLockdown.js';
import { upsertCaseLog } from './functions/logging/upsertCaseLog.js';
import { logger } from './logger.js';
import { kBree } from './tokens.js';

export async function registerJobs() {
	const client = container.resolve<Client<true>>(Client);
	const bree = container.resolve<Bree>(kBree);

	bree.on('worker created', (name: string) => {
		bree.workers.get(name)?.on(
			'message',
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			async (message: string | { op: JobType; d: { guildId: Snowflake; channelId: Snowflake; caseId: number } }) => {
				if (typeof message !== 'string') {
					switch (message.op) {
						case JobType.Case: {
							try {
								const guild = client.guilds.resolve(message.d.guildId);
								if (!guild) {
									return;
								}
								const case_ = await deleteCase({ guild, user: client.user, caseId: message.d.caseId });
								await upsertCaseLog(guild, client.user, case_);
							} catch (e) {
								const error = e as Error;
								logger.error(error, error.message);
							}
							return;
						}

						case JobType.Lockdown: {
							try {
								await deleteLockdown(message.d.channelId);
							} catch (e) {
								const error = e as Error;
								logger.error(error, error.message);
							}
							break;
						}

						default:
							break;
					}
				}
			},
		);
	});

	bree.on('worker deleted', (name: string) => {
		bree.workers.get(name)?.removeAllListeners();
	});

	logger.info({ job: { name: 'modActionTimers' } }, `Registering job: modActionTimers`);
	await bree.add({
		name: 'modActionTimers',
		interval: '1m',
		path: fileURLToPath(new URL('./jobs/modActionTimers.js', import.meta.url)),
	});

	logger.info({ job: { name: 'modLockdownTimers' } }, `Registering job: modLockdownTimers`);
	await bree.add({
		name: 'modLockdownTimers',
		interval: '1m',
		path: fileURLToPath(new URL('./jobs/modLockdownTimers.js', import.meta.url)),
	});

	logger.info({ job: { name: 'scamDomainUpdateTimers' } }, 'Registering job: scamDomainUpdateTimers');
	await bree.add({
		name: 'scamDomainUpdateTimers',
		interval: '5m',
		timeout: 0,
		path: fileURLToPath(new URL('./jobs/scamDomainUpdateTimers.js', import.meta.url)),
	});
}

export async function startJobs() {
	const bree = container.resolve<Bree>(kBree);
	await bree.start();
}
