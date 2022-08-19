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
		create function set_updated_at() returns trigger
		language plpgsql
		as $$
		declare
		_new record;
		begin
			_new := new;
			_new."updated_at" = now();
			return _new;
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
			target_tag text,
			author_id text,
			author_tag text,
			mod_id text,
			mod_tag text,
			reason text,
			attachment_url text,
			log_message_id text,
			ref_id integer,
			updated_at timestamp with time zone,
			created_at timestamp with time zone default now() not null
		);

		comment on column reports.guild_id is 'The id of the guild this report belongs to';
		comment on column reports.report_id is 'The report id';
		comment on column reports.type is 'The type of report';
		comment on column reports.status is 'The status of the report';
		comment on column reports.message_id is 'The id of the message thats been reported';
		comment on column reports.channel_id is 'The id of the channel thats been reported';
		comment on column reports.target_id is 'The id of the target thats been reported';
		comment on column reports.target_tag is 'The tag of the target thats been reported';
		comment on column reports.author_id is 'The id of the author that reported the target';
		comment on column reports.author_tag is 'The tag of the author that reported the target';
		comment on column reports.mod_id is 'The id of the moderator that handled the report';
		comment on column reports.mod_tag is 'The tag of the moderator that handled the report';
		comment on column reports.reason is 'The reason for the report';
		comment on column reports.log_message_id is 'The id of the log message sent';
		comment on column reports.ref_id is 'The case id associated with this report';
		comment on column reports.updated_at is 'The last time the report was updated';
		comment on column reports.created_at is 'The time the report was created';

		alter table reports
			add constraint reports_pkey primary key (guild_id, report_id);

		create trigger set_updated_at before update on reports for each row execute function set_updated_at();
		comment on trigger set_updated_at on reports is 'Sets the updated_at field to the current time';		
	`);

	await sql.unsafe(`
		alter table cases
			add report_ref integer;
	`);
}
