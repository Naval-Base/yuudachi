/**
 * @param {import('postgres').Sql} sql
 */
export async function up(sql) {
	await sql.unsafe(`
		alter table guild_settings
			add enable_reports boolean not null default true;

		comment on column reports.context_messages_ids is 'The ids of the messages that were used add context to the report.'
	`);
}
