/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add report_labels jsonb default '{}'::jsonb;

		comment on column guild_settings.report_labels is 'The forum labels used for report status display';
	`);
}
