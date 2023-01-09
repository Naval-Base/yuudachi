import clean from "@aero/sanitizer";
import type { GuildMember } from "discord.js";
import type RE2 from "re2";

/**
 * Check if a member should be kept in the set, based on its join timestamp
 *
 * @param member - Member to check
 * @param joinAfter - Floor value for join timestamp, if any
 * @param joinBefore - Ceilling value for join timestamp, if any
 * @returns Whether the member should be kept in the set
 */
export function joinFilter(
	member: GuildMember,
	joinAfter?: number | null | undefined,
	joinBefore?: number | null | undefined,
) {
	if (!member.joinedTimestamp) {
		return true;
	}

	return (
		member.joinedTimestamp >= (joinAfter ?? Number.NEGATIVE_INFINITY) &&
		member.joinedTimestamp <= (joinBefore ?? Number.POSITIVE_INFINITY)
	);
}

/**
 * Check if a member should be kept in the set, based on its user creation timestamp
 *
 * @param member - Member to check
 * @param ageAfter - Floor value for creation timestamp, if any
 * @param ageBefore - Ceilling value for creation timestamp, if any
 * @returns Whether the member should be kept in the set
 */
export function ageFilter(
	member: GuildMember,
	ageAfter?: number | null | undefined,
	ageBefore?: number | null | undefined,
) {
	return (
		member.user.createdTimestamp >= (ageAfter ?? Number.NEGATIVE_INFINITY) &&
		member.user.createdTimestamp <= (ageBefore ?? Number.POSITIVE_INFINITY)
	);
}

/**
 * Check if a member should be kept in the set, based on its username
 *
 * @param member - Member to check
 * @param pattern - The name pattern to check against, if any
 * @param confusables - Whether the pattern should be resistent against confusables
 * @returns Whether the member should be kept in the set
 */
export function patternFilter(member: GuildMember, pattern?: RE2 | RegExp | null | undefined, confusables = true) {
	if (!pattern) {
		return true;
	}

	const usernames = [member.user.username];

	if (confusables) {
		usernames.push(clean(member.user.username));
	}

	return usernames.some((username) => pattern.test(username));
}

/**
 * Check if a member should be kept in the set, based on its avatar
 *
 * @param member - Member to check
 * @param avatar - The avatar to check against, if any
 * @returns Whether the member should be kept in the set
 */
export function avatarFilter(member: GuildMember, avatar?: string | null | undefined) {
	if (!avatar) {
		return true;
	}

	if (avatar.toLowerCase() === "none") {
		return !member.avatar && !member.user.avatar;
	}

	return member.avatar === avatar || member.user.avatar === avatar;
}

/**
 * Check if a member should be kept in the set, based on zalgo in its username
 *
 * @param member - Member to check
 * @returns Whether the member has any zalgo in its username
 */
export function zalgoFilter(member: GuildMember) {
	return /[\u0300-\u036F]/g.test(member.user.username);
}

/**
 * Check if a member should be kept in the set, based on confusables in its username
 *
 * @param member - Member to check
 * @returns Whether the member has any confusables in its username
 */
export function confusablesFilter(member: GuildMember) {
	return member.user.username.toLowerCase() !== clean(member.user.username).toLowerCase();
}
