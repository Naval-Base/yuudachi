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

-- SETTINGS

alter table settings rename guild to guild_id;

-- TAGS

alter table tags rename guild to guild_id;
alter table tags rename "user" to user_id;
