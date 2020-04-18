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

-- SETTINGS

alter table settings rename guild to guild_id;

alter table settings
	alter guild_id type bigint using guild_id::bigint
;

-- TAGS

alter table tags rename guild to guild_id;
alter table tags rename "user" to user_id;

alter table tags
	alter guild_id type bigint using guild_id::bigint,
	alter user_id type bigint using user_id::bigint
;
