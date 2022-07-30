import clean from '@aero/sanitizer';
import type { GuildMember } from 'discord.js';
import type RE2 from 're2';

export function joinFilter(member: GuildMember, joinFrom?: number | null, joinTo?: number | null) {
	if (!member.joinedTimestamp) {
		return false;
	}

	return (
		member.joinedTimestamp <= (joinFrom ?? Number.NEGATIVE_INFINITY) ||
		member.joinedTimestamp >= (joinTo ?? Number.POSITIVE_INFINITY)
	);
}

export function ageFilter(member: GuildMember, ageFrom?: number | null, ageTo?: number | null) {
	return (
		member.user.createdTimestamp <= (ageFrom ?? Number.NEGATIVE_INFINITY) ||
		member.user.createdTimestamp >= (ageTo ?? Number.POSITIVE_INFINITY)
	);
}

export function patternFilter(member: GuildMember, pattern?: RegExp | RE2 | null, confusables = true) {
	if (!pattern) {
		return false;
	}

	const usernames = [member.user.username];

	if (confusables) {
		usernames.push(clean(member.user.username));
	}

	return !usernames.some((username) => pattern.test(username));
}

export function avatarFilter(member: GuildMember, avatar?: string | null) {
	if (!avatar) {
		return false;
	}

	if (avatar.toLowerCase() === 'none') {
		return Boolean(member.user.avatar);
	}

	return member.user.avatar !== avatar;
}

export function zalgoFilter(member: GuildMember) {
	return !/[\u0300-\u036F]/g.test(member.user.username);
}

export function confusablesFilter(member: GuildMember) {
	return member.user.username.toLowerCase() === clean(member.user.username).toLowerCase();
}
