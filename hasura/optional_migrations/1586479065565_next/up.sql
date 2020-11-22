-- UTIL

create function next_case(bigint) returns integer
language plpgsql
stable
as $$
declare next_id integer;
begin
	select max(case_id) into next_id from cases where guild_id = $1;
	if next_id is null then return 1; end if;
	return next_id + 1;
end;
$$;

-- MESSAGES

create table messages (
	id bigint,
	channel_id bigint not null,
	guild_id bigint,
	author_id bigint,
	content text,
	"type" integer,
	flags integer,
	embeds jsonb,
	attachments jsonb,
	created_at timestamp default now() not null,
	edited_at timestamp
);

alter table messages
	add constraint messages_pkey primary key (id)
;

comment on column public.messages.id IS 'The message id';
comment on column public.messages.channel_id IS 'The id of the channel this message belongs to';
comment on column public.messages.guild_id IS 'The id of the guild this message belongs to';
comment on column public.messages.author_id IS 'The id of the author this message belongs to';
comment on column public.messages.content IS 'The content of this message';
comment on column public.messages.type IS 'The type of this message';
comment on column public.messages.flags IS 'The flags of this message';
comment on column public.messages.embeds IS 'The embeds of this message';
comment on column public.messages.attachments IS 'The attachments of this message';

-- CASES

alter table cases rename "message" to log_message_id;
alter table cases rename guild to guild_id;
alter table cases rename mute_message to context_message_id;
alter table cases rename action_duration to action_expiration;

alter table cases
	alter log_message_id type bigint using log_message_id::bigint,
	alter guild_id type bigint using guild_id::bigint,
	alter target_id type bigint using target_id::bigint,
	alter mod_id type bigint using mod_id::bigint,
	alter context_message_id type bigint using context_message_id::bigint,
	add role_id bigint,
	drop constraint cases_pkey,
	drop id,
	add constraint cases_pkey primary key (guild_id, case_id)
;

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
	end;

-- LOCKDOWNS

alter table lockdowns rename channel to channel_id;
alter table lockdowns rename duration to expiration;

alter table lockdowns
	drop constraint lockdowns_guild_channel_key,
	drop constraint lockdowns_pkey,
	drop id,
	drop guild,
	alter channel_id type bigint using channel_id::bigint,
	add constraint lockdowns_pkey primary key (channel_id)
;

-- ROLE STATES

alter table role_states rename guild to guild_id;
alter table role_states rename member to member_id;

alter table role_states
	alter guild_id type bigint using guild_id::bigint,
	alter member_id type bigint using member_id::bigint,
	drop constraint role_states_guild_member_key,
	drop constraint role_states_pkey,
	drop id,
	add constraint role_states_pkey primary key (guild_id, member_id)
;

-- GUILD_SETTINGS

create table guild_settings (
	guild_id bigint,
	prefix text,
	mod_log_channel_id bigint,
	mod_role_id bigint,
	guild_log_channel_id bigint,
	member_log_channel_id bigint,
	mute_role_id bigint,
	tag_role_id bigint,
	embed_role_id bigint,
	emoji_role_id bigint,
	reaction_role_id bigint,
	role_state boolean,
	moderation boolean
);

alter table guild_settings
	add constraint guild_settings_pkey primary key (guild_id)
;

insert into guild_settings (
	select guild::bigint as guild_id,
		coalesce((settings ->> 'PREFIX')::text, '?') as prefix,
		(settings ->> 'MOD_LOG')::bigint as mod_log_channel_id,
		(settings ->> 'MOD_ROLE')::bigint as mod_role_id,
		(settings ->> 'GUILD_LOG')::bigint as guild_log_channel_id,
		(settings -> 'MEMBER_LOG' ->> 'ID')::bigint as member_log_channel_id,
		(settings ->> 'MUTE_ROLE')::bigint as mute_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'TAG')::bigint as tag_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'EMBED')::bigint as embed_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'EMOJI')::bigint as emoji_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'REACTION')::bigint as reaction_role_id,
		coalesce((settings ->> 'ROLE_STATE')::boolean, false) as role_state,
		coalesce((settings ->> 'MODERATION')::boolean, false) as moderation
	from settings
);

drop table settings;

-- TAGS

alter table tags rename guild to guild_id;
alter table tags rename "user" to user_id;

alter table tags
	alter guild_id type bigint using guild_id::bigint,
	alter user_id type bigint using user_id::bigint
;
