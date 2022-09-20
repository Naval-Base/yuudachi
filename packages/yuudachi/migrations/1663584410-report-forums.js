/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add report_status_labels text[] default '{}'::text[],
			add report_type_labels text[] default '{}'::text[];

		comment on column guild_settings.report_status_labels is 'The forum labels to use to sync status [pending, approved, rejected, spam]';
		comment on column guild_settings.report_type_labels is 'The forum labels to show report types [user_report, message_report]';
	`);
}
