-- TAGS

alter table tags
	alter guild_id set data type text,
	alter user_id set data type text
;

alter table tags rename user_id to "user";
alter table tags rename guild_id to guild;

-- SETTINGS

alter table settings
	alter guild_id set data type text
;

alter table settings rename guild_id to guild;

-- ROLE STATES

alter table role_states
	alter guild_id set data type text,
	alter member_id set data type text,
	drop constraint role_states_pkey,
	add id uuid default gen_random_uuid() not null,
	add constraint role_states_pkey primary key (id),
	add constraint role_states_guild_member_key unique (guild_id, member_id)
;

alter table role_states rename guild_id to guild;
alter table role_states rename member_id to member;

-- LOCKDOWNS

alter table lockdowns
	add id uuid default gen_random_uuid() not null,
	add guild text not null,
	alter channel_id set data type text,
	drop constraint lockdowns_pkey,
	add constraint lockdowns_pkey primary key (id),
	add constraint lockdowns_guild_channel_key unique (guild, channel_id)
;

alter table lockdowns rename channel_id to channel;
alter table lockdowns rename expiration to duration;

-- CASES

alter table cases
	alter log_message_id set data type text,
	alter guild_id set data type text,
	alter target_id set data type text,
	alter mod_id set data type text,
	alter context_message_id set data type text,
	drop role_id,
	drop constraint cases_pkey,
	add id uuid default gen_random_uuid() not null,
	add constraint cases_pkey primary key (id)
;

alter table cases rename log_message_id to "message";
alter table cases rename guild_id to guild;
alter table cases rename context_message_id to mute_message;
alter table cases rename action_expiration to action_duration;

-- MESSAGES

drop table messages;

-- UTIL

drop function next_case;
