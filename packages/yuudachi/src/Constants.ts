export const enum Color {
	DiscordEmbedBackground = 0x2f3136,
	DiscordSuccess = 0x57f287,
	DiscordDanger = 0xed4245,
	DiscordWarning = 0xfee75c,
	DiscordPrimary = 0x5865f2,
	DiscordGem = 0xeb459e,
	LogsMessageDelete = 0xb75cff,
	LogsMessaegUpdate = 0x5c6cff,
}

export const enum ThreatLevelColor {
	Level0 = 0x7ef31f,
	Level1 = 0x80f31f,
	Level2 = 0xa5de0b,
	Level3 = 0xc7c101,
	Level4 = 0xe39e03,
	Level5 = 0xf6780f,
	Level6 = 0xfe5326,
	Level7 = 0xfb3244,
}

export const MAX_TRUST_ACCOUNT_AGE = 1000 * 60 * 60 * 24 * 7 * 4;
export const SPAM_THRESHOLD = 4;
export const SPAM_EXPIRE_SECONDS = 30;
export const MENTION_THRESHOLD = 10;
export const MENTION_EXPIRE_SECONDS = 60;
export const SCAM_THRESHOLD = 3;
export const SCAM_EXPIRE_SECONDS = 5 * 60;
export const ANTI_RAID_NUKE_AVATAR_BITS = 16;
export const ANTI_RAID_NUKE_AVATAR_THRESHOLD = 5;
export const ANTI_RAID_NUKE_PROGRESS_SPLIT = 50;

export const DATE_FORMAT_LOGFILE = 'YYYY-MM-DD_HH-mm-ss';
export const DATE_FORMAT_WITH_SECONDS = 'YYYY/MM/DD HH:mm:ss';

export const EMBED_TITLE_LIMIT = 256;
export const EMBED_DESCRIPTION_LIMIT = 4096;
export const EMBED_FOOTER_TEXT_LIMIT = 2048;
export const EMBED_AUTHOR_NAME_LIMIT = 256;
export const EMBED_FIELD_LIMIT = 25;
export const EMBED_FIELD_NAME_LIMIT = 256;
export const EMBED_FIELD_VALUE_LIMIT = 1024;
export const SNOWFLAKE_MIN_LENGTH = 17;
export const AUTOMOD_FLAG_INDICATOR_FIELD_NAME = 'flagged_message_id';
export const AUTOCOMPLETE_CHOICE_LIMIT = 25;
export const AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT = 100;

