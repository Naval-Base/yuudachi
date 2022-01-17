import type Bree from 'bree';
import { Client } from 'discord.js';
import { fileURLToPath, URL } from 'node:url';
import { container } from 'tsyringe';

import { JobType } from './Constants';
import { deleteCase } from './functions/cases/deleteCase';
import { deleteLockdown } from './functions/lockdowns/deleteLockdown';
import { upsertCaseLog } from './functions/logs/upsertCaseLog';
import { logger } from './logger';
import { kBree } from './tokens';

export function registerJobs() {
	const bree = container.resolve<Bree>(kBree);

	logger.info({ job: { name: 'modActionTimers' } }, `Registering job: modActionTimers`);
	bree.add({
		name: 'modActionTimers',
		interval: '1m',
		path: fileURLToPath(new URL('./jobs/modActionTimers.js', import.meta.url)),
	});

	logger.info({ job: { name: 'modLockdownTimers' } }, `Registering job: modLockdownTimers`);
	bree.add({
		name: 'modLockdownTimers',
		interval: '1m',
		path: fileURLToPath(new URL('./jobs/modLockdownTimers.js', import.meta.url)),
	});

	logger.info({ job: { name: 'scamDomainUpdateTimers' } }, 'Registering job: scamDomainUpdateTimers');
	bree.add({
		name: 'scamDomainUpdateTimers',
		interval: '5m',
		timeout: 0,
		path: fileURLToPath(new URL('./jobs/scamDomainUpdateTimers.js', import.meta.url)),
	});

	logger.info({ job: { name: 'discordScamDomainUpdateTimers' } }, 'Registering job: discordScamDomainUpdateTimers');
	bree.add({
		name: 'discordScamDomainUpdateTimers',
		interval: '5m',
		timeout: 0,
		path: fileURLToPath(new URL('./jobs/discordScamDomainUpdateTimers.js', import.meta.url)),
	});
}

export function startJobs() {
	const client = container.resolve<Client<true>>(Client);
	const bree = container.resolve<Bree>(kBree);

	bree.on('worker created', (name) => {
		// @ts-expect-error
		bree.workers[name]?.on('message', async (message) => {
			if (message !== 'done') {
				switch (message.op) {
					case JobType.Case: {
						try {
							const guild = await client.guilds.fetch(message.d.guildId);
							const case_ = await deleteCase({ guild, user: client.user, caseId: message.d.caseId });
							await upsertCaseLog(message.d.guildId, client.user, case_);
						} catch (e) {
							const error = e as Error;
							logger.error(error, error.message);
						}
						break;
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
				}
			}
		});
	});

	bree.on('worker deleted', (name) => {
		// @ts-expect-error
		bree.workers[name]?.removeAllListeners();
	});

	bree.start();
}
