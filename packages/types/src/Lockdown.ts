export interface CreateLockdown {
	channelId: `${bigint}`;
	expiration: Date;
	moderatorId: `${bigint}`;
	reason?: string;
}

export interface DeleteLockdown {
	channelId: `${bigint}`;
}

export interface Lockdown {
	guildId: `${bigint}`;
	channelId: `${bigint}`;
	expiration: Date;
	moderatorId: `${bigint}`;
	reason?: string;
	overwrites?: Record<`${bigint}`, any>[];
}
