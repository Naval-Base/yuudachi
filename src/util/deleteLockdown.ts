import type { GuildChannel, PermissionOverwrites } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../tokens';

export async function deleteLockdown(channel: GuildChannel, locale: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [channelOverwrites] = await sql<[{ overwrites: PermissionOverwrites[] }?]>`
		select overwrites
		from lockdowns
		where channel_id = ${channel.id}`;

	if (!channelOverwrites) {
		throw new Error(
			i18next.t('command.mod.lockdown.lift.errors.failure', {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
		);
	}

	await channel.permissionOverwrites.set(channelOverwrites.overwrites);

	await sql`
		delete
		from lockdowns
		where channel_id = ${channel.id}`;

	return channel.id;
}
