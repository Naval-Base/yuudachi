-- TAGS

alter table tags rename user_id to "user";
alter table tags rename guild_id to guild;

-- SETTINGS

create table settings (
	guild text,
	settings jsonb default '{}'::json
);

alter table settings
	add constraint settings_pkey primary key (guild)
;

insert into settings (
	select guild_id as guild,
		to_jsonb(
			(
				select d
				from (
					select prefix as "PREFIX",
						mod_log_channel_id as "MOD_LOG",
						mod_role_id as "MOD_ROLE",
						guild_log_id as "GUILD_LOG",
						member_log_id as "MEMBER_LOG",
						mute_role_id as "MUTE_ROLE",
						role_state as "ROLE_STATE",
						moderation as "MODERATION",
						json_build_object(
							'TAG', tag_role_id,
							'EMBED', embed_role_id,
							'EMOJI', emoji_role_id,
							'REACTION', reaction_role_id
						) as "RESTRICT_ROLES"
				) d)
		) as settings
	from guild_settings;
);

drop table guild_settings;

-- ROLE STATES

alter table role_states
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

-- CONNECTIONS

drop table connections;

-- PROVIDERS

drop type providers;

-- USERS

drop table users;

-- UTIL

drop function next_case;
