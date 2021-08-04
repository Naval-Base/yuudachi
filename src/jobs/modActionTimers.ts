import type { Snowflake } from 'discord-api-types/v9';
import { parentPort } from 'node:worker_threads';
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

const currentCases = await sql<[{ guild_id: Snowflake; case_id: number; action_expiration: string }]>`
	select guild_id, case_id, action_expiration
	from cases
	where action_processed = false`;

for (const case_ of currentCases) {
	if (Date.parse(case_.action_expiration) <= Date.now()) {
		if (parentPort) {
			parentPort.postMessage({ op: JobType.Case, d: { guildId: case_.guild_id, caseId: case_.case_id } });
		}
	}
}

if (parentPort) {
	parentPort.postMessage('done');
} else {
	process.exit(0);
}
