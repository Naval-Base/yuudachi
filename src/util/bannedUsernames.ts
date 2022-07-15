import type { Redis } from 'ioredis';
import type { BannedUsernameData } from '../functions/anti-raid/usernameCheck.js';

export interface RawBannedUsernameData {
	name: string;
	regex: string;
}

export async function getAllBannedUsernames(redis: Redis): Promise<BannedUsernameData[]> {
	const bannedUsernames = await redis.hgetall('banned_usernames');

	return Object.entries(bannedUsernames).map(([name, regex]) => ({
		name,
		regex: new RegExp(regex, 'i'),
	}));
}

export async function addBannedUsername(redis: Redis, data: RawBannedUsernameData): Promise<boolean> {
	return Boolean(await redis.hset('banned_usernames', { [data.name]: data.regex }));
}

export async function removeBannedUsername(redis: Redis, name: string): Promise<boolean> {
	return Boolean(await redis.hdel('banned_usernames', name));
}
