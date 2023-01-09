/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add report_status_tags text[] default '{}'::text[],
			add report_type_tags text[] default '{}'::text[];

		alter table reports
			rename column log_message_id to log_post_id;

		comment on column guild_settings.report_status_tags is 'The forum labels to use to sync status [pending, approved, rejected, spam]';
		comment on column guild_settings.report_type_tags is 'The forum labels to show report types [message_report, user_report]';
		comment on column reports.log_post_id is 'The id of the report ticket post';
	`);
}
