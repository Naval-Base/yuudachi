/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add column log_ignore_channels text[] not null default '{}'::text[]
	`);
}
