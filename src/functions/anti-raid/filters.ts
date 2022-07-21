import clean from '@aero/sanitizer';
import type { GuildMember } from 'discord.js';
import type RE2 from 're2';

export function joinFilter(
	member: GuildMember,
	joinFrom: number = Number.NEGATIVE_INFINITY,
	joinTo: number = Number.POSITIVE_INFINITY,
): boolean {
	if (!member.joinedTimestamp) return false;
	return member.joinedTimestamp >= joinFrom && member.joinedTimestamp <= joinTo;
}

export function ageFilter(
	member: GuildMember,
	ageFrom: number = Number.NEGATIVE_INFINITY,
	ageTo: number = Number.POSITIVE_INFINITY,
): boolean {
	return member.user.createdTimestamp >= ageFrom && member.user.createdTimestamp <= ageTo;
}

export function patternFilter(member: GuildMember, pattern: RegExp | RE2 | undefined, confusables = true): boolean {
	if (!pattern) return true;
	const usernames = [member.user.username];
	if (confusables) {
		usernames.push(clean(member.user.username));
	}
	return usernames.some((username) => pattern.test(username));
}

export function avatarFilter(member: GuildMember, avatar?: string): boolean {
	if (!avatar) return true;

	if (avatar.toLowerCase() === 'nopfp') {
		return !member.user.avatar;
	}
	return member.user.avatar === avatar;
}

export function zalgoFilter(member: GuildMember): boolean {
	return /[\u0300-\u036F]/g.test(member.user.username);
}

export function confusablesFilter(member: GuildMember): boolean {
	return member.user.username.toLowerCase() !== clean(member.user.username).toLowerCase();
}
