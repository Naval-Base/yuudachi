/** @param {import('postgres').Sql} sql */
export async function up(sql) {
	await sql.unsafe(`
		create function next_report(text) returns integer
		language plpgsql
		stable
		as $$
		declare next_id integer;
		begin
			select max(report_id) into next_id from reports where guild_id = $1;
			if next_id is null then return 1; end if;
			return next_id + 1;
		end;
		$$;`);

	await sql.unsafe(`
		alter table guild_settings
			add report_channel_id text;
	`);

	await sql.unsafe(`
		create table reports (
			guild_id text,
			report_id integer,
			type integer,
			status integer,
			message_id text,
			channel_id text,
			target_id text,
			author_id text,
			reason text,
			attachment_url text,
			log_message_id text,
			ref_id integer,
			created_at timestamp with time zone default now() not null,
		);

		comment on column reports.guild_id is 'The id of the guild this report belongs to';
		comment on column reports.report_id is 'The report id';
		comment on column reports.type is 'The type of report';
		comment on column reports.status is 'The status of the report';
		comment on column reports.message_id is 'The id of the message thats been reported';
		comment on column reports.channel_id is 'The id of the channel thats been reported';
		comment on column reports.target_id is 'The id of the target thats been reported';
		comment on column reports.author_id is 'The id of the author that reported the target';
		comment on column reports.reason is 'The reason for the report';
		comment on column reports.log_message_id is 'The id of the log message sent';
		comment on column reports.ref_id is 'The case id associated with this report';
		comment on column reports.created_at is 'The time the report was created';

		alter table reports
			add constraint reports_pkey primary key (guild_id, report_id);
	`);

	await sql.unsafe(`
		alter table cases
			rename ref_id to case_ref_id;
		alter table cases
			add report_ref_id integer;
	`);
}
