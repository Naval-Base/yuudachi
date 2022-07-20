import type { Redis } from 'ioredis';
import RE2 from 're2';
import type { FlaggedUsernameData } from '../functions/anti-raid/usernameCheck.js';

export interface RawFlaggedUsernameData {
	name: string;
	regex: string;
}

export async function getAllFlaggedUsernames(redis: Redis): Promise<FlaggedUsernameData[]> {
	const flaggedUsernames = await redis.hgetall('flagged_usernames');

	return Object.entries(flaggedUsernames).map(([name, regex]) => ({
		name,
		regex: new RE2(regex, 'i'),
	}));
}

export async function addFlaggedUsername(redis: Redis, data: RawFlaggedUsernameData): Promise<boolean> {
	return Boolean(await redis.hset('flagged_usernames', { [data.name]: data.regex }));
}

export async function removeFlaggedUsername(redis: Redis, name: string): Promise<boolean> {
	return Boolean(await redis.hdel('flagged_usernames', name));
}
