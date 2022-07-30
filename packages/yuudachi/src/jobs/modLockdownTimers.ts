import process from 'node:process';
import { parentPort } from 'node:worker_threads';
import type { Snowflake } from 'discord.js';
import { JobType } from '../Constants.js';
import { createPostgres } from '../util/postgres.js';

const sql = createPostgres();

const currentLockdowns = await sql<[{ channel_id: Snowflake; expiration: string }]>`
	select channel_id, expiration
	from lockdowns`;

for (const lockdown of currentLockdowns) {
	if (Date.parse(lockdown.expiration) <= Date.now()) {
		if (parentPort) {
			parentPort.postMessage({ op: JobType.Lockdown, d: { channelId: lockdown.channel_id } });
		}
	}
}

if (parentPort) {
	parentPort.postMessage('done');
} else {
	process.exit(0);
}
