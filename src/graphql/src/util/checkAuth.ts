import type { Snowflake } from 'discord-api-types/v8';
import { container } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import type { Sql } from 'postgres';

const { kSQL } = Tokens;

export async function checkAuth(guild_id: Snowflake) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [user] = await sql<[{ user_id: string }?]>`
		select user_id
		from guild_moderators
		where guild_id = ${guild_id}`;

	if (user?.user_id) {
		return true;
	}

	return false;
}
