import type { GuildChannel, PermissionOverwrites } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';

export async function deleteLockdown(channel: GuildChannel) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [channelOverwrites] = await sql<[{ overwrites: PermissionOverwrites[] }?]>`
		select overwrites
		from lockdowns
		where channel_id = ${channel.id}`;

	if (!channelOverwrites) {
		return null;
	}

	await channel.permissionOverwrites.set(channelOverwrites.overwrites);

	await sql`
		delete
		from lockdowns
		where channel_id = ${channel.id}`;

	return channel.id;
}
