import { OverwriteType, PermissionFlagsBits } from 'discord-api-types/v10';
import type { GuildChannel, PermissionOverwrites, Snowflake } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { type RawLockdown, transformLockdown } from './transformLockdown.js';
import { kSQL } from '../../tokens.js';

export interface Lockdown {
	guildId: Snowflake;
	channelId: Snowflake;
	expiration: string;
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

export async function createLockdown(lockdown: CreateLockdown & { channel: GuildChannel }) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const overwrites = [...lockdown.channel.permissionOverwrites.cache.values()];

	await lockdown.channel.permissionOverwrites.set([
		{
			id: lockdown.guildId,
			allow: 0n,
			deny:
				PermissionFlagsBits.SendMessages |
				PermissionFlagsBits.AddReactions |
				PermissionFlagsBits.CreatePublicThreads |
				PermissionFlagsBits.CreatePrivateThreads |
				PermissionFlagsBits.SendMessagesInThreads,
			type: OverwriteType.Role,
		},
		{
			id: lockdown.channel.client.user!.id,
			allow: PermissionFlagsBits.SendMessages | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles,
			type: OverwriteType.Member,
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
			${lockdown.expiration},
			${lockdown.moderatorId},
			${lockdown.moderatorTag},
			${lockdown.reason ?? null},
			${sql.json(overwrites)}
		)
		returning *`;

	return transformLockdown(newLockdown);
}
