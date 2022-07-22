export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add column general_log_channel_id text;
	`);
}
