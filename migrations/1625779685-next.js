export async function up(sql) {
	await sql.unsafe(`
		create function next_case(text) returns integer
		language plpgsql
		stable
		as $$
		declare next_id integer;
		begin
			select max(case_id) into next_id from cases where guild_id = $1;
			if next_id is null then return 1; end if;
			return next_id + 1;
		end;
		$$;`);

	await sql.unsafe(`
		create table messages (
			id text,
			channel_id text not null,
			guild_id text,
			author_id text,
			content text,
			"type" integer,
			flags integer,
			embeds jsonb,
			attachments jsonb,
			created_at timestamp with time zone default now() not null,
			updated_at timestamp with time zone
		);
		
		comment on column messages.id is 'The message id';
		comment on column messages.channel_id is 'The id of the channel this message belongs to';
		comment on column messages.guild_id is 'The id of the guild this message belongs to';
		comment on column messages.author_id is 'The id of the author this message belongs to';
		comment on column messages.content is 'The content of this message';
		comment on column messages.type is 'The type of this message';
		comment on column messages.flags is 'The flags of this message';
		comment on column messages.embeds is 'The embeds of this message';
		comment on column messages.attachments is 'The attachments of this message';
		
		alter table messages
			add constraint messages_pkey primary key (id)
		;`);

	await sql.unsafe(`
		alter table cases rename "message" to log_message_id;
		alter table cases rename guild to guild_id;
		alter table cases rename mute_message to context_message_id;
		alter table cases rename action_duration to action_expiration;
		
		alter table cases
			add role_id text,
			drop constraint cases_pkey,
			drop id,
			add constraint cases_pkey primary key (guild_id, case_id)
		;
		
		comment on column cases.guild_id is 'The id of the guild this case belongs to';
		comment on column cases.log_message_id is 'The id of the message this case belongs to';
		comment on column cases.case_id is 'The case id';
		comment on column cases.ref_id is 'The id of the case this case references';
		comment on column cases.target_id is 'The id of the target this case belongs to';
		comment on column cases.target_tag is 'The tag of the target this case belongs to';
		comment on column cases.mod_id is 'The id of the moderator this case belongs to';
		comment on column cases.mod_tag is 'The tag of the moderator this case belongs to';
		comment on column cases.action is 'The action of this case';
		comment on column cases.reason is 'The reason of this case';
		comment on column cases.action_expiration is 'The expiration of this case';
		comment on column cases.action_processed is 'Whether this case has been processed or not';
		comment on column cases.context_message_id is 'The id of the message around this mute';
		
		update cases set
			action = case
				when action = 1 then 5
				when action = 2 then 6
				when action = 3 then 4
				when action = 4 then 3
				when action = 5 then 0
				when action = 6 then 0
				when action = 7 then 0
				when action = 8 then 0
				when action = 9 then 2
				when action = 10 then 0
			end;`);

	await sql.unsafe(`
		alter table lockdowns rename guild to guild_id;
		alter table lockdowns rename channel to channel_id;
		alter table lockdowns rename duration to expiration;

		alter table lockdowns
			drop constraint lockdowns_guild_channel_key,
			drop constraint lockdowns_pkey,
			drop id,
			add constraint lockdowns_pkey primary key (channel_id)
		;

		alter table lockdowns
			add column mod_id text not null,
			add column mod_tag text not null,
			add column reason text,
			add column overwrites jsonb not null
		;

		comment on column lockdowns.guild_id IS 'The id of the guild this lockdown belongs to';
		comment on column lockdowns.channel_id IS 'The id of the channel this lockdown belongs to';
		comment on column lockdowns.expiration IS 'The expiration of the lockdown';
		comment on column lockdowns.mod_id IS 'The id of the moderator that executed this lockdown';
		comment on column lockdowns.mod_tag IS 'The tag of the moderator that executed this lockdown';
		comment on column lockdowns.reason IS 'The reason of this lockdown';
		comment on column lockdowns.overwrites IS 'The overwrites before this lockdown';`);

	await sql.unsafe(`
		alter table role_states rename guild to guild_id;
		alter table role_states rename member to member_id;

		alter table role_states
			drop constraint role_states_guild_member_key,
			drop constraint role_states_pkey,
			drop id,
			add constraint role_states_pkey primary key (guild_id, member_id)
		;

		comment on column role_states.guild_id is 'The id of the guild this role state belongs to';
		comment on column role_states.member_id is 'The id of the member this role state belongs to';
		comment on column role_states.roles is 'The roles of this role state';`);

	await sql.unsafe(`
		create table guild_settings (
			guild_id text,
			mod_log_channel_id text,
			mod_role_id text,
			guild_log_webhook_id text,
			member_log_webhook_id text,
			mute_role_id text,
			embed_role_id text,
			emoji_role_id text,
			reaction_role_id text,
			locale text default 'en'
		);
		
		comment on column guild_settings.guild_id IS 'The id of the guild this setting belongs to';
		comment on column guild_settings.mod_log_channel_id IS 'The id of the guilds mod log channel';
		comment on column guild_settings.mod_role_id IS 'The id of the guilds mod role';
		comment on column guild_settings.member_log_webhook_id IS 'The id of the guilds member log webhook';
		comment on column guild_settings.guild_log_webhook_id IS 'The id of the guilds log webhook';
		comment on column guild_settings.mute_role_id IS 'The id of the guilds mute role';
		comment on column guild_settings.embed_role_id IS 'The id of the guilds embed restriction role';
		comment on column guild_settings.emoji_role_id IS 'The id of the guilds emoji restriction role';
		comment on column guild_settings.reaction_role_id IS 'The id of the guilds reaction restriction role';
		comment on column guild_settings.locale IS 'The locale of the guild';
		
		
		alter table guild_settings
			add constraint guild_settings_pkey primary key (guild_id)
		;
		
		insert into guild_settings (
			select guild as guild_id,
				(settings ->> 'MOD_LOG')::text as mod_log_channel_id,
				(settings ->> 'MOD_ROLE')::text as mod_role_id,
				(settings ->> 'GUILD_LOG')::text as guild_log_webhook_id,
				(settings -> 'MEMBER_LOG' ->> 'ID')::text as member_log_webhook_id,
				(settings ->> 'MUTE_ROLE')::text as mute_role_id,
				(settings -> 'RESTRICT_ROLES' ->> 'EMBED')::text as embed_role_id,
				(settings -> 'RESTRICT_ROLES' ->> 'EMOJI')::text as emoji_role_id,
				(settings -> 'RESTRICT_ROLES' ->> 'REACTION')::text as reaction_role_id
			from settings
		);
		
		drop table settings;`);

	await sql.unsafe(`drop table tags;`);
}
