/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			alter column locale set default 'en-US'
	`);
}
