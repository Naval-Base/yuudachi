import postgres, { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../tokens.js';

export function createPostgres(): Sql<any> {
	const sql = postgres({
		types: {
			date: {
				to: 1184,
				from: [1082, 1083, 1114, 1184],
				serialize: (date: Date) => date.toISOString(),
				parse: (isoString: string) => isoString,
			},
		},
	});
	container.register(kSQL, { useValue: sql });

	return sql;
}
