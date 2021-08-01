import type Bree from 'bree';
import { Client } from 'discord.js';
import { fileURLToPath, URL } from 'node:url';
import { container } from 'tsyringe';

import { JobType } from './Constants';
import { deleteCase } from './functions/cases/deleteCase';
import { deleteLockdown } from './functions/lockdowns/deleteLockdown';
import { upsertCaseLog } from './functions/logs/upsertCaseLog';
import { kBree } from './tokens';

export function registerJobs() {
	const bree = container.resolve<Bree>(kBree);

	bree.add({
		name: 'modActionTimers',
		interval: '1m',
		path: fileURLToPath(new URL('./jobs/modActionTimers.js', import.meta.url)),
	});
	bree.add({
		name: 'modLockdownTimers',
		interval: '1m',
		path: fileURLToPath(new URL('./jobs/modLockdownTimers.js', import.meta.url)),
	});
}

export function startJobs() {
	const client = container.resolve<Client<true>>(Client);
	const bree = container.resolve<Bree>(kBree);

	bree.on('worker created', (name) => {
		// @ts-expect-error
		bree.workers[name].on('message', async (message) => {
			if (message !== 'done') {
				switch (message.op) {
					case JobType.Case: {
						try {
							const guild = await client.guilds.fetch(message.d.guildId);
							const case_ = await deleteCase({ guild, user: client.user, caseId: message.d.caseId });
							void upsertCaseLog(message.d.guildId, client.user, case_);
						} catch {}
						break;
					}

					case JobType.Lockdown: {
						void deleteLockdown(message.d.channelId);
						break;
					}
				}
			}
		});
	});

	bree.on('worker deleted', (name) => {
		// @ts-expect-error
		bree.workers[name].removeAllListeners();
	});

	bree.start();
}
