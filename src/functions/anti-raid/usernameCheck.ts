import clean from '@aero/sanitizer';
import { remove } from 'confusables';
import type { Redis } from 'ioredis';
import { getAllBannedUsernames } from '../../util/bannedUsernames.js';

export interface BannedUsernameData {
	name: string;
	regex: RegExp;
}

export async function checkUsername(redis: Redis, username: string): Promise<BannedUsernameData | null> {
	const bannedUsernames = await getAllBannedUsernames(redis);
	const sanitizedUsername = clean(remove(username));

	for (const entry of bannedUsernames) {

		if (entry.regex.test(sanitizedUsername)) {
			return entry;
		}
	}

	return null;
}
