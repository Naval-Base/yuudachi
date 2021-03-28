import type { Snowflake } from 'discord-api-types/v8';

export interface CreateLockdown {
	channelId: Snowflake;
	expiration: Date;
	moderatorId: Snowflake;
	reason?: string;
}

export interface DeleteLockdown {
	channelId: Snowflake;
}

export interface Lockdown {
	guildId: Snowflake;
	channelId: Snowflake;
	expiration: Date;
	moderatorId: Snowflake;
	reason?: string;
	overwrites?: Record<Snowflake, any>[];
}
