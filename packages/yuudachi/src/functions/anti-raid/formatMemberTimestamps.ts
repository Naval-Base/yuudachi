import { ms } from "@naval-base/ms";
import type { Collection, GuildMember } from "discord.js";

export function formatMemberTimestamps(members: Collection<string, GuildMember>) {
	let creationLower = Number.POSITIVE_INFINITY;
	let creationUpper = Number.NEGATIVE_INFINITY;
	let joinLower = Number.POSITIVE_INFINITY;
	let joinUpper = Number.NEGATIVE_INFINITY;

	for (const member of members.values()) {
		if (member.joinedTimestamp) {
			joinLower = Math.min(member.joinedTimestamp, joinLower);
			joinUpper = Math.max(member.joinedTimestamp, joinUpper);
		}

		creationLower = Math.min(member.user.createdTimestamp, creationLower);
		creationUpper = Math.max(member.user.createdTimestamp, creationUpper);
	}

	const creationRange = ms(creationUpper - creationLower, true);
	const joinRange = ms(joinUpper - joinLower, true);

	return {
		creationRange,
		joinRange,
	} as const;
}
