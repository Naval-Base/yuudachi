import { remove } from 'confusables';
import type { Redis } from 'ioredis';
import { getAllBannedUsernames } from '../../util/bannedUsernames.js';

export interface BannedUsernameData {
	name: string;
	regex: RegExp;
}

export async function checkUsername(redis: Redis, username: string): Promise<BannedUsernameData | null> {
	const bannedUsernames = await getAllBannedUsernames(redis);

	for (const entry of bannedUsernames) {
		const sanitizedUsername = remove(username);

		if (entry.regex.test(sanitizedUsername)) {
			return entry;
		}
	}

	return null;
}
