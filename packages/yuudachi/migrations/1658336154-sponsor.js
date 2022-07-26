/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add column sponsor_role_id text
	`);
}
