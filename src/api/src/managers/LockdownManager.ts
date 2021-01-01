import { Sql } from 'postgres';
import Rest from '@yuudachi/rest';
import { Lockdown } from '@yuudachi/types';
import { inject, injectable } from 'tsyringe';
import { Tokens } from '@yuudachi/core';
import { APIChannel, APIOverwrite, APIUser, OverwriteType, PermissionFlagsBits, Routes } from 'discord-api-types/v8';

const { kSQL } = Tokens;

export interface RawLockdown {
	expiration: string;
	channel_id: string;
	guild_id: string;
}

export type PatchLockdown = Exclude<Lockdown, 'guildId'>;

@injectable()
export default class LockdownManager {
	public constructor(
		@inject(kSQL)
		public readonly sql: Sql<any>,
		public readonly rest: Rest,
	) {}

	public async create(lockdown: Lockdown) {
		const mod: APIUser = await this.rest.get<APIUser>(Routes.user(lockdown.moderatorId));
		const channel: APIChannel = await this.rest.get(Routes.channel(lockdown.channelId));

		await this.rest.put(Routes.channelPermission(lockdown.channelId, lockdown.guildId), {
			allow: (0).toString(),
			deny: (PermissionFlagsBits.SEND_MESSAGES | PermissionFlagsBits.ADD_REACTIONS).toString(),
			type: OverwriteType.Role,
		});

		const [newLockdown] = await this.sql<{ mod_tag: string; overwrites: APIOverwrite[] }>`
			insert into moderation.lockdowns (
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
				${`${mod.username}#${mod.discriminator}`},
				${lockdown.reason ?? null},
				${this.sql.json(channel.permission_overwrites ?? [])}
			)
			returning mod_tag, overwrites`;

		lockdown.overwrites = newLockdown.overwrites;
		return lockdown;
	}

	public async delete(channelId: string) {
		const [channelOverwrites] = await this.sql<{ overwrites: APIOverwrite[] }>`
			select overwrites
			from moderation.lockdowns
			where channel_id = ${channelId}`;

		for (const overwrite of channelOverwrites.overwrites) {
			await this.rest.put(Routes.channelPermission(channelId, overwrite.id), {
				allow: overwrite.allow,
				deny: overwrite.deny,
				type: OverwriteType.Role,
			});
		}

		await this.sql`
			delete
			from moderation.lockdowns
			where channel_id = ${channelId}`;

		return channelId;
	}
}
