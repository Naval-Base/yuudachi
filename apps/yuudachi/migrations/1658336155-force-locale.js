/**
 * @param {import('postgres').Sql} sql
 */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add column force_locale boolean default false
	`);
}
