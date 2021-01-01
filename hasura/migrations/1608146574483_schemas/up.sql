-- SCHEMA

create schema "moderation";
create schema "logs";
create schema "organizational";

-- LOG_SETTINGS

create table logs.guild_settings as table guild_settings;

COMMENT ON COLUMN logs.guild_settings.guild_id IS 'The id of the guild this setting belongs to';
COMMENT ON COLUMN logs.guild_settings.guild_log_channel_id IS 'The id of the guilds log channel';

alter table logs.guild_settings
	add constraint settings_pkey primary key (guild_id),
	drop prefix,
	drop mod_log_channel_id,
	drop member_log_channel_id,
	drop mod_role_id,
	drop mute_role_id,
	drop tag_role_id,
	drop embed_role_id,
	drop emoji_role_id,
	drop reaction_role_id,
	drop locale,
	drop modules,
	drop repository_aliases
;

alter table guild_settings
	drop guild_log_channel_id
;

-- MESSAGES

create table logs.messages (
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

comment on column logs.messages.id is 'The message id';
comment on column logs.messages.channel_id is 'The id of the channel this message belongs to';
comment on column logs.messages.guild_id is 'The id of the guild this message belongs to';
comment on column logs.messages.author_id is 'The id of the author this message belongs to';
comment on column logs.messages.content is 'The content of this message';
comment on column logs.messages.type is 'The type of this message';
comment on column logs.messages.flags is 'The flags of this message';
comment on column logs.messages.embeds is 'The embeds of this message';
comment on column logs.messages.attachments is 'The attachments of this message';

alter table logs.messages
	add constraint messages_pkey primary key (id)
;

create trigger set_logs_messages_updated_at before update on logs.messages for each row execute function public.set_current_timestamp_updated_at();
comment on trigger set_logs_messages_updated_at on logs.messages is 'trigger to set value of column "updated_at" to current timestamp on row update';

-- MOD_SETTINGS

create table moderation.guild_settings as table guild_settings;

COMMENT ON COLUMN moderation.guild_settings.guild_id IS 'The id of the guild this setting belongs to';
COMMENT ON COLUMN moderation.guild_settings.mod_log_channel_id IS 'The id of the guilds mod log channel';
COMMENT ON COLUMN moderation.guild_settings.member_log_channel_id IS 'The id of the guilds member log channel';
COMMENT ON COLUMN moderation.guild_settings.mod_role_id IS 'The id of the guilds mod role';
COMMENT ON COLUMN moderation.guild_settings.mute_role_id IS 'The id of the guilds mute role';
COMMENT ON COLUMN moderation.guild_settings.tag_role_id IS 'The id of the guilds tag restriction role';
COMMENT ON COLUMN moderation.guild_settings.embed_role_id IS 'The id of the guilds embed restriction role';
COMMENT ON COLUMN moderation.guild_settings.emoji_role_id IS 'The id of the guilds emoji restriction role';
COMMENT ON COLUMN moderation.guild_settings.reaction_role_id IS 'The id of the guilds reaction restriction role';

alter table moderation.guild_settings
	add constraint settings_pkey primary key (guild_id),
	drop prefix,
	drop locale,
	drop modules,
	drop repository_aliases
;

alter table guild_settings
	drop mod_log_channel_id,
	drop member_log_channel_id,
	drop mod_role_id,
	drop mute_role_id,
	drop tag_role_id,
	drop embed_role_id,
	drop emoji_role_id,
	drop reaction_role_id
;

-- CASES

create table moderation.cases as table cases;

comment on column moderation.cases.guild_id is 'The id of the guild this case belongs to';
comment on column moderation.cases.log_message_id is 'The id of the message this case belongs to';
comment on column moderation.cases.case_id is 'The case id';
comment on column moderation.cases.ref_id is 'The id of the case this case references';
comment on column moderation.cases.target_id is 'The id of the target this case belongs to';
comment on column moderation.cases.target_tag is 'The tag of the target this case belongs to';
comment on column moderation.cases.mod_id is 'The id of the moderator this case belongs to';
comment on column moderation.cases.mod_tag is 'The tag of the moderator this case belongs to';
comment on column moderation.cases.action is 'The action of this case';
comment on column moderation.cases.reason is 'The reason of this case';
comment on column moderation.cases.action_expiration is 'The expiration of this case';
comment on column moderation.cases.action_processed is 'Whether this case has been processed or not';
comment on column moderation.cases.context_message_id is 'The id of the message around this mute';

alter table moderation.cases alter column action_processed set default true;
alter table moderation.cases alter column created_at set default now();

alter table moderation.cases alter column guild_id set not null;
alter table moderation.cases alter column case_id set not null;
alter table moderation.cases alter column target_id set not null;
alter table moderation.cases alter column target_tag set not null;
alter table moderation.cases alter column "action" set not null;
alter table moderation.cases alter column action_processed set not null;
alter table moderation.cases alter column created_at set not null;

alter table moderation.cases
	add constraint cases_pkey primary key (guild_id, case_id)
;

drop table cases cascade;

-- LOCKDOWNS

create table moderation.lockdowns as table lockdowns;

COMMENT ON COLUMN moderation.lockdowns.guild_id IS 'The id of the guild this lockdown belongs to';
COMMENT ON COLUMN moderation.lockdowns.channel_id IS 'The id of the channel this lockdown belongs to';
COMMENT ON COLUMN moderation.lockdowns.expiration IS 'The expiration of the lockdown';

alter table moderation.lockdowns alter column guild_id set not null;
alter table moderation.lockdowns alter column channel_id set not null;
alter table moderation.lockdowns alter column expiration set not null;

alter table moderation.lockdowns
	add constraint lockdowns_pkey primary key (channel_id)
;

drop table lockdowns cascade;

-- ROLE_STATES

create table moderation.role_states as table role_states;

comment on column moderation.role_states.guild_id is 'The id of the guild this role state belongs to';
comment on column moderation.role_states.member_id is 'The id of the member this role state belongs to';
comment on column moderation.role_states.roles is 'The roles of this role state';

alter table moderation.role_states alter column roles set default '{}'::text[];

alter table moderation.role_states alter column guild_id set not null;
alter table moderation.role_states alter column member_id set not null;
alter table moderation.role_states alter column roles set not null;

alter table moderation.role_states
	add constraint role_states_pkey primary key (guild_id, member_id)
;

drop table role_states cascade;


-- TAGS

create table organizational.tags as table tags;

comment on column organizational.tags.guild_id is 'The id of the guild this tag belongs to';
comment on column organizational.tags.user_id is 'The id of the user this tag belongs to';
comment on column organizational.tags.last_modified is 'The id of the user who last modified this tag';

alter table organizational.tags alter column aliases set default '{}'::text[];
alter table organizational.tags alter column uses set default 0;
alter table organizational.tags alter column created_at set default now();
alter table organizational.tags alter column updated_at set default now();

alter table organizational.tags alter column guild_id set not null;
alter table organizational.tags alter column user_id set not null;
alter table organizational.tags alter column "name" set not null;
alter table organizational.tags alter column aliases set not null;
alter table organizational.tags alter column content set not null;
alter table organizational.tags alter column uses set not null;
alter table organizational.tags alter column created_at set not null;
alter table organizational.tags alter column updated_at set not null;

alter table organizational.tags
	add constraint tags_pkey primary key (guild_id, name)
;

create trigger set_organizational_tags_updated_at before update on organizational.tags for each row execute function public.set_current_timestamp_updated_at();
comment on trigger set_organizational_tags_updated_at on organizational.tags is 'trigger to set value of column "updated_at" to current timestamp on row update';

drop table tags cascade;

-- UTIL

create function next_case(text) returns integer
language plpgsql
stable
as $$
declare next_id integer;
begin
	select max(case_id) into next_id from moderation.cases where guild_id = $1;
	if next_id is null then return 1; end if;
	return next_id + 1;
end;
$$;
