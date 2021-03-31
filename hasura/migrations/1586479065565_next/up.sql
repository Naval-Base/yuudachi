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

-- USERS

create table users (
	id uuid default gen_random_uuid() not null,
	email text not null,
	username text not null,
	token_reset_at timestamp
);

alter table users add constraint users_pkey primary key (id);

comment on column users.id is 'The id of this user';
comment on column users.email is 'The email of this user';
comment on column users.username is 'The username of this user';
comment on column users.token_reset_at is 'When this user''s token was reset';

-- CONNECTIONS

create table connections (
	id text not null,
	user_id uuid not null,
	avatar text,
	access_token text not null,
	refresh_token text,
	expires_at timestamp with time zone
);

alter table connections add constraint connections_pkey primary key (id);
alter table connections add constraint connections_user_id_fkey foreign key (user_id) references users (id) on delete cascade;

comment on column connections.id is 'The user id of this connection';
comment on column connections.user_id is 'The id of the user this connection belongs to';
comment on column connections.avatar is 'The access token of this connection';
comment on column connections.access_token is 'The access token of this connection';
comment on column connections.refresh_token is 'The refresh token of this connection';
comment on column connections.expires_at is 'The expiration of this connections access token';

-- GUILD MODERATORS

create table guild_moderators (
	guild_id text not null,
	user_id uuid not null,
	manage boolean default false
);

alter table guild_moderators add constraint guild_moderators_pkey primary key (guild_id, user_id);
alter table guild_moderators add constraint guild_moderators_user_id_fkey foreign key (user_id) references users (id) on delete cascade;

comment on column guild_moderators.guild_id is 'The id of the guild this moderator belongs to';
comment on column guild_moderators.user_id is 'The id of the moderator';
comment on column guild_moderators.manage is 'Whether this moderator can manage the guild';

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
;

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
	end;

-- LOCKDOWNS

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
comment on column lockdowns.overwrites IS 'The overwrites before this lockdown';

-- ROLE_STATES

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
comment on column role_states.roles is 'The roles of this role state';

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

comment on column guild_settings.guild_id IS 'The id of the guild this setting belongs to';
comment on column guild_settings.prefix IS 'The prefix of the guild';
comment on column guild_settings.mod_log_channel_id IS 'The id of the guilds mod log channel';
comment on column guild_settings.mod_role_id IS 'The id of the guilds mod role';
comment on column guild_settings.member_log_channel_id IS 'The id of the guilds member log channel';
comment on column guild_settings.guild_log_channel_id IS 'The id of the guilds log channel';
comment on column guild_settings.mute_role_id IS 'The id of the guilds mute role';
comment on column guild_settings.tag_role_id IS 'The id of the guilds tag restriction role';
comment on column guild_settings.embed_role_id IS 'The id of the guilds embed restriction role';
comment on column guild_settings.emoji_role_id IS 'The id of the guilds emoji restriction role';
comment on column guild_settings.reaction_role_id IS 'The id of the guilds reaction restriction role';
comment on column guild_settings.locale IS 'The locale of the guild';
comment on column guild_settings.modules IS 'The modules of the guild';
comment on column guild_settings.repository_aliases IS 'The repository aliases of the guild';


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
	drop templated,
	add constraint tags_pkey primary key (guild_id, name)
;

comment on column tags.guild_id is 'The id of the guild this tag belongs to';
comment on column tags.user_id is 'The id of the user this tag belongs to';
comment on column tags.last_modified is 'The id of the user who last modified this tag';
