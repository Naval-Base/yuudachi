import { parentPort } from 'node:worker_threads';
import type { Snowflake } from 'discord-api-types/v9';
import postgres from 'postgres';
import { JobType } from '../Constants';

const sql = postgres({
	types: {
		date: {
			to: 1184,
			from: [1082, 1083, 1114, 1184],
			serialize: (date: Date) => date.toISOString(),
			parse: (isoString) => isoString,
		},
	},
});

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
