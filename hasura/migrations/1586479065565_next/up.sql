-- UTIL

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
$$;

-- ROLES

create type roles as enum('admin', 'moderator', 'user');

-- USERS

create table users (
  id uuid default gen_random_uuid() not null,
  email text not null,
  username text not null,
  role roles default 'user',
  token_reset_at timestamp
);

alter table users add constraint users_pkey primary key (id);

comment on column users.id is 'The id of this user';
comment on column users.email is 'The email of this user';
comment on column users.username is 'The username of this user';
comment on column users.token_reset_at is 'When this user''s token was reset';

-- PROVIDERS

create type providers as enum('discord', 'twitch');

-- CONNECTIONS

create table connections (
  id text not null,
  user_id uuid not null,
  provider providers not null,
  main boolean default false,
  avatar text,
  access_token text not null,
  refresh_token text,
  expires_at timestamp with time zone
);

alter table connections add constraint connections_pkey primary key (id);
alter table connections add constraint connections_user_id_fkey foreign key (user_id) references users (id) on delete cascade;

comment on column connections.id is 'The user id of this connection';
comment on column connections.user_id is 'The id of the user this connection belongs to';
comment on column connections.provider is 'The provider this connection belongs to';
comment on column connections.avatar is 'The access token of this connection';
comment on column connections.access_token is 'The access token of this connection';
comment on column connections.refresh_token is 'The refresh token of this connection';
comment on column connections.expires_at is 'The expiration of this connections access token';

-- MESSAGES

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
	add role_id text,
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
	add constraint lockdowns_pkey primary key (channel_id)
;

-- ROLE STATES

alter table role_states rename guild to guild_id;
alter table role_states rename member to member_id;

alter table role_states
	drop constraint role_states_guild_member_key,
	drop constraint role_states_pkey,
	drop id,
	add constraint role_states_pkey primary key (guild_id, member_id)
;

-- GUILD_SETTINGS

create table guild_settings (
	guild_id text,
	prefix text default '?',
	mod_log_channel_id text,
	mod_role_id text,
	guild_log_channel_id text,
	member_log_channel_id text,
	mute_role_id text,
	tag_role_id text,
	embed_role_id text,
	emoji_role_id text,
	reaction_role_id text,
	role_state boolean default false,
	moderation boolean default false,
	locale text default 'en',
	repository_aliases text[]
);

alter table guild_settings
	add constraint guild_settings_pkey primary key (guild_id)
;

insert into guild_settings (
	select guild as guild_id,
		coalesce((settings ->> 'PREFIX')::text, '?') as prefix,
		(settings ->> 'MOD_LOG')::text as mod_log_channel_id,
		(settings ->> 'MOD_ROLE')::text as mod_role_id,
		(settings ->> 'GUILD_LOG')::text as guild_log_channel_id,
		(settings -> 'MEMBER_LOG' ->> 'ID')::text as member_log_channel_id,
		(settings ->> 'MUTE_ROLE')::text as mute_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'TAG')::text as tag_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'EMBED')::text as embed_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'EMOJI')::text as emoji_role_id,
		(settings -> 'RESTRICT_ROLES' ->> 'REACTION')::text as reaction_role_id,
		coalesce((settings ->> 'ROLE_STATE')::boolean, false) as role_state,
		coalesce((settings ->> 'MODERATION')::boolean, false) as moderation
	from settings
);

drop table settings;

-- TAGS

alter table tags rename guild to guild_id;
alter table tags rename "user" to user_id;
