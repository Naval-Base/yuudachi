import type { Guild, Snowflake } from "discord.js";

export async function resolveMemberAndUser(guild: Guild, id: Snowflake) {
	try {
		const member = await guild.members.fetch(id);

		return { member, user: member.user } as const;
	} catch {
		const user = await guild.client.users.fetch(id);

		return { user } as const;
	}
}
