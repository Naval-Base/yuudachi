/**
 * @param {import('postgres').Sql} sql
 */
export async function up(sql) {
	await sql.unsafe(`
		alter table reports
			add context_messages_ids text[] default '{}'::text[];

		comment on column reports.context_messages_ids is 'The ids of the messages that were used add context to the report.'
	`);
}
