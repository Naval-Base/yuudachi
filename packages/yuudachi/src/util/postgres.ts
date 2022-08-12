import postgres, { type Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../tokens.js';

export function createPostgres(register = true): Sql<any> {
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

	if (register) {
		container.register(kSQL, { useValue: sql });
	}

	return sql;
}
