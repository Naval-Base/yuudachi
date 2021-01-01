-- ROLES

create table user_role (
	"value" text primary key,
	comment text
);

insert into user_role ("value") values
	('admin'),
	('moderator'),
	('user');

-- USERS

create table users (
	id uuid default gen_random_uuid() not null,
	email text not null,
	username text not null,
	"role" text not null,
	token_reset_at timestamp
);

alter table users add constraint users_pkey primary key (id);
alter table users add constraint users_role_fkey foreign key ("role") references user_role;

comment on column users.id is 'The id of this user';
comment on column users.email is 'The email of this user';
comment on column users.username is 'The username of this user';
comment on column users."role" is 'The role of this user';
comment on column users.token_reset_at is 'When this user''s token was reset';

-- PROVIDERS

create table connection_provider (
	"value" text primary key,
	comment text
);

insert into connection_provider ("value") values
	('discord'),
	('twitch');

-- CONNECTIONS

create table connections (
	id text not null,
	user_id uuid not null,
	"provider" text not null,
	main boolean default false,
	avatar text,
	access_token text not null,
	refresh_token text,
	expires_at timestamp with time zone
);

alter table connections add constraint connections_pkey primary key (id);
alter table connections add constraint connections_user_id_fkey foreign key (user_id) references users (id) on delete cascade;
alter table connections add constraint connections_provider_fkey foreign key ("provider") references connection_provider;

comment on column connections.id is 'The user id of this connection';
comment on column connections.user_id is 'The id of the user this connection belongs to';
comment on column connections.provider is 'The provider this connection belongs to';
comment on column connections.main is 'Whether this is the main account of this users connection';
comment on column connections.avatar is 'The access token of this connection';
comment on column connections.access_token is 'The access token of this connection';
comment on column connections.refresh_token is 'The refresh token of this connection';
comment on column connections.expires_at is 'The expiration of this connections access token';

-- CASES

alter table cases rename "message" to log_message_id;
alter table cases rename guild to guild_id;
alter table cases rename mute_message to context_message_id;
alter table cases rename action_duration to action_expiration;

alter table cases
	add role_id text,
	drop constraint cases_pkey,
	drop id
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

alter table lockdowns rename guild to guild_id;
alter table lockdowns rename channel to channel_id;
alter table lockdowns rename duration to expiration;

alter table lockdowns
	drop constraint lockdowns_guild_channel_key,
	drop constraint lockdowns_pkey,
	drop id
;

-- ROLE_STATES

alter table role_states rename guild to guild_id;
alter table role_states rename member to member_id;

alter table role_states
	drop constraint role_states_guild_member_key,
	drop constraint role_states_pkey,
	drop id
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
	locale text default 'en',
	modules integer default 2,
	repository_aliases text[]
);

COMMENT ON COLUMN guild_settings.guild_id IS 'The id of the guild this setting belongs to';
COMMENT ON COLUMN guild_settings.prefix IS 'The prefix of the guild';
COMMENT ON COLUMN guild_settings.locale IS 'The locale of the guild';
COMMENT ON COLUMN guild_settings.modules IS 'The modules of the guild';
COMMENT ON COLUMN guild_settings.repository_aliases IS 'The repository aliases of the guild';

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
		(settings -> 'RESTRICT_ROLES' ->> 'REACTION')::text as reaction_role_id
	from settings
);

drop table settings;

-- TAGS

alter table tags rename guild to guild_id;
alter table tags rename "user" to user_id;

alter table tags
	drop constraint tags_guild_name_key,
	drop constraint tags_pkey,
	drop id,
	drop hoisted,
	drop templated
;
