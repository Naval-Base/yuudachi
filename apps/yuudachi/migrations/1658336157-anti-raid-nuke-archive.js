/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add column anti_raid_nuke_archive_channel_id text
	`);
}
