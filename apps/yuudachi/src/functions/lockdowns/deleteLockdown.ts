import { kSQL, container } from "@yuudachi/framework";
import { Client } from "discord.js";
import type { PermissionOverwrites, GuildChannel, Snowflake } from "discord.js";
import type { Sql } from "postgres";

export async function deleteLockdown(channelId: Snowflake) {
	const client = container.resolve<Client<true>>(Client);
	const sql = container.resolve<Sql<any>>(kSQL);

	try {
		const channel = client.channels.resolve(channelId) as GuildChannel;

		const [channelOverwrites] = await sql<[{ overwrites: PermissionOverwrites[] }?]>`
			select overwrites
			from lockdowns
			where channel_id = ${channel.id}
		`;

		if (!channelOverwrites) {
			return null;
		}

		await channel.permissionOverwrites.set(channelOverwrites.overwrites);
	} finally {
		await sql`
			delete
			from lockdowns
			where channel_id = ${channelId}
		`;
	}

	return channelId;
}
