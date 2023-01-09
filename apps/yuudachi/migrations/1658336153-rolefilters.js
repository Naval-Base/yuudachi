/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add column automod_ignore_roles text[] not null default '{}'::text[]
	`);
}
