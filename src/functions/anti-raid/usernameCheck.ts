import clean from '@aero/sanitizer';
import { remove } from 'confusables';
import type { Redis } from 'ioredis';
import { getAllFlaggedUsernames } from '../../util/flaggedUsernames.js';

export interface FlaggedUsernameData {
	name: string;
	regex: RegExp;
}

export async function checkUsername(redis: Redis, username: string): Promise<FlaggedUsernameData | null> {
	const flaggedUsernames = await getAllFlaggedUsernames(redis);
	const sanitizedUsername = clean(remove(username));

	for (const entry of flaggedUsernames) {
		if (entry.regex.test(sanitizedUsername)) {
			return entry;
		}
	}

	return null;
}
