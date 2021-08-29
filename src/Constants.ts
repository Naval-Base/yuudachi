export const enum JobType {
	Case,
	Lockdown,
	ScamDomains,
}

export const MAX_TRUST_ACCOUNT_AGE = 1000 * 60 * 60 * 24 * 7 * 4;
export const SPAM_THRESHOLD = 3;
export const SPAM_EXPIRE_SECONDS = 20;

export const DATE_FORMAT_LOGFILE = 'YYYY-MM-DD_HH-mm-ss';

export const EMBED_TITLE_LIMIT = 256;
export const EMBED_DESCRIPTION_LIMIT = 4096;
export const EMBED_FOOTER_TEXT_LIMIT = 2048;
export const EMBED_AUTHOR_NAME_LIMIT = 256;
export const EMBED_FIELD_LIMIT = 25;
export const EMBED_FIELD_NAME_LIMIT = 256;
export const EMBED_FIELD_VALUE_LIMIT = 1024;
