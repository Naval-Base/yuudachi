/**
 * @param {import('postgres').Sql} sql
 */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			drop embed_role_id,
			drop emoji_role_id,
			drop reaction_role_id
	`);
}
