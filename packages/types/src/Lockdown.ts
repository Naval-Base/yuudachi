export interface CreateLockdown {
	channelId: string;
	expiration: Date;
	moderatorId: string;
	reason?: string;
}

export interface DeleteLockdown {
	channelId: string;
}

export interface Lockdown {
	guildId: string;
	channelId: string;
	expiration: Date;
	moderatorId: string;
	reason?: string;
	overwrites?: Record<string, any>[];
}
