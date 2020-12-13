export enum CommandModules {
	None = 0,
	Config = 1,
	Utility = 1 << 1,
	Moderation = 1 << 2,
	All = Config | Utility | Moderation,
}

export const DISCORD_EPOCH = 1420070400000;
export const DATE_FORMAT_WITH_SECONDS = 'yyyy/MM/dd HH:mm:ss';
export const DATE_FORMAT_DATE = 'yyyy/MM/dd';

export const DOCUMENTATION_SOURCES = [
	'stable',
	'master',
	'rpc',
	'commando',
	'akairo',
	'akairo-master',
	'v11',
	'collection',
];

export const EMBED_TITLE_LIMIT = 256;
export const EMBED_DESCRIPTION_LIMIT = 2048;
export const EMBED_FOOTER_TEXT_LIMIT = 2048;
export const EMBED_AUTHOR_NAME_LIMIT = 256;
export const EMBED_FIELD_LIMIT = 25;
export const EMBED_FIELD_NAME_LIMIT = 256;
export const EMBED_FIELD_VALUE_LIMIT = 1024;
export const MESSAGE_CONTENT_LIMIT = 2000;
