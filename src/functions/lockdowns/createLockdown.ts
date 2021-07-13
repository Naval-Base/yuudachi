import { PermissionFlagsBits } from 'discord-api-types/v8';
import type { GuildChannel, PermissionOverwrites, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import { kSQL } from '../../tokens';
import { RawLockdown, transformLockdown } from './transformLockdown';

export interface Lockdown {
	guildId: Snowflake;
	channelId: Snowflake;
	expiration: Date;
	reason?: string | null;
	moderatorId: Snowflake;
	moderatorTag: string;
	overwrites?: PermissionOverwrites[];
}

export interface CreateLockdown {
	guildId: Snowflake;
	channelId: Snowflake;
	expiration: Date;
	reason?: string | null;
	moderatorId: Snowflake;
	moderatorTag: string;
}

export async function createLockdown(lockdown: CreateLockdown & { channel?: GuildChannel }) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const overwrites = [...(lockdown.channel?.permissionOverwrites.cache.values() ?? [])];

	await lockdown.channel?.permissionOverwrites.set([
		{
			id: lockdown.guildId,
			allow: 0n,
			deny: PermissionFlagsBits.SEND_MESSAGES | PermissionFlagsBits.ADD_REACTIONS,
			type: 'role',
		},
	]);

	const [newLockdown] = await sql<[RawLockdown]>`
		insert into lockdowns (
			guild_id,
			channel_id,
			expiration,
			mod_id,
			mod_tag,
			reason,
			overwrites
		) values (
			${lockdown.guildId},
			${lockdown.channelId},
			${lockdown.expiration.toISOString()},
			${lockdown.moderatorId},
			${lockdown.moderatorTag},
			${lockdown.reason ?? null},
			${sql.json(overwrites)}
		)
		returning *`;

	return transformLockdown(newLockdown);
}
