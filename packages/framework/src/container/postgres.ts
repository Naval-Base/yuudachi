import { container } from "tsyringe";
import { kSQL } from "./tokens.js";

export async function createPostgres() {
	const postgres = await import("postgres");

	const sql = postgres.default({
		types: {
			date: {
				to: 1_184,
				from: [1_082, 1_083, 1_114, 1_184],
				serialize: (date: Date) => date.toISOString(),
				parse: (isoString: string) => isoString,
			},
		},
	});
	container.register(kSQL, { useValue: sql });
}
