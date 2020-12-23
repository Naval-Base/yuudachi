-- LOCKDOWNS

alter table moderation.lockdowns
	add column mod_id text not null,
	add column mod_tag text not null,
	add column reason text,
	add column overwrites jsonb not null
;

COMMENT ON COLUMN moderation.lockdowns.mod_id IS 'The id of the moderator that executed this lockdown';
COMMENT ON COLUMN moderation.lockdowns.mod_tag IS 'The tag of the moderator that executed this lockdown';
COMMENT ON COLUMN moderation.lockdowns.reason IS 'The reason of this lockdown';
COMMENT ON COLUMN moderation.lockdowns.overwrites IS 'The overwrites before this lockdown';
