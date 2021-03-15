import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import { Sql } from 'postgres';

const { kSQL } = Tokens;

export async function checkAuth(guild_id: `${bigint}`) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [user] = await sql<{ user_id: string }[]>`
		select user_id
		from guild_moderators
		where guild_id = ${guild_id}`;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (user?.user_id) {
		return true;
	}

	return false;
}
