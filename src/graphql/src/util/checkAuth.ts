import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import { Sql } from 'postgres';

const { kSQL } = Tokens;

export async function checkAuth(guild_id: `${bigint}`) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [{ user_id }] = await sql`
		select user_id
		from guild_moderators
		where guild_id = ${guild_id}`;

	if (!user_id) {
		return false;
	}

	return true;
}
