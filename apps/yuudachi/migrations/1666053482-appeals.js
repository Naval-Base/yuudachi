/**
 * @param {import('postgres').Sql} sql
 */
export async function up(sql) {
	await sql.unsafe(`
		create function next_appeal(text) returns integer
		language plpgsql
		stable
		as $$
		declare next_id integer;
		begin
			select max(appeal_id) into next_id from appeals where guild_id = $1;
			if next_id is null then return 1; end if;
			return next_id + 1;
		end;
		$$;`);

	await sql.unsafe(`
		alter table guild_settings
			add appeal_channel_id text;
	`);

	await sql.unsafe(`
		create table appeals (
			guild_id text,
			appeal_id integer,
			status integer,
			target_id text,
			target_tag text,
			mod_id text,
			mod_tag text,
			reason text,
			ref_id integer,
			updated_at timestamp with time zone,
			created_at timestamp with time zone default now() not null
		);

		comment on column appeals.guild_id is 'The id of the guild this appeal belongs to';
		comment on column appeals.appeal_id is 'The appeal id';
		comment on column appeals.status is 'The status of the appeal';
		comment on column appeals.target_id is 'The id of the target thats been appealed';
		comment on column appeals.target_tag is 'The tag of the target thats been appealed';
		comment on column appeals.mod_id is 'The id of the moderator that handled the appeal';
		comment on column appeals.mod_tag is 'The tag of the moderator that handled the appeal';
		comment on column appeals.reason is 'The reason for the appeal';
		comment on column appeals.ref_id is 'The case id associated with this appeal';
		comment on column appeals.updated_at is 'The last time the appeal was updated';
		comment on column appeals.created_at is 'The time the appeal was created';

		alter table appeals
			add constraint appeals_pkey primary key (guild_id, appeal_id);

		create trigger set_updated_at before update on appeals for each row execute function set_current_timestamp_updated_at();
		comment on trigger set_updated_at on appeals is 'Sets the updated_at field to the current time';
	`);

	await sql.unsafe(`
		alter table cases
			add appeal_ref_id integer;

		comment on column cases.appeal_ref_id is 'The appeal id that this case is associated with';
	`);
}
