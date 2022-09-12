import dayjs from "dayjs";
import {
	type Snowflake,
	type ChatInputCommandInteraction,
	type ModalSubmitInteraction,
	Collection,
	type GuildMember,
} from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { container } from "tsyringe";
import { ANTI_RAID_NUKE_SAFETY_LOCK_RELEASE_SECONDS, DATE_FORMAT_WITH_SECONDS } from "../../../../Constants.js";
import { canBan } from "../../../../functions/anti-raid/canBan.js";
import { kRedis } from "../../../../tokens.js";
import { resolveTimestamp } from "../../../../util/timestamp.js";

/**
 * Acquire an anti-raid-nuke lock for a guild
 *
 * @param guildId - Id representing the guild the lock is for
 * @returns True, if the lock was acquired, false if already locked
 */
export async function acquireNukeLock(guildId: Snowflake) {
	const redis = container.resolve<Redis>(kRedis);
	const key = `guild:${guildId}:anti_raid_nuke`;
	if (await redis.exists(key)) {
		return false;
	}

	await redis.set(key, Date.now(), "EX", ANTI_RAID_NUKE_SAFETY_LOCK_RELEASE_SECONDS);
	return true;
}

/**
 * Release an anti-raid-nuke lock for a guild
 *
 * @param guildId - Id representing the guild the lock is for
 * @returns True, if the lock was released, false if there was no lock
 */
export async function releaseNukeLock(guildId: Snowflake) {
	const redis = container.resolve<Redis>(kRedis);
	const key = `guild:${guildId}:anti_raid_nuke`;
	if (await redis.exists(key)) {
		await redis.del(key);
		return true;
	}

	return false;
}

export async function acquireLockIfPublic(guildId: Snowflake, locale: string, hidden = false) {
	if (!hidden) {
		const acquiredLock = await acquireNukeLock(guildId);
		if (!acquiredLock) {
			throw new Error(
				i18next.t("command.mod.anti_raid_nuke.common.errors.no_concurrent_use", {
					lng: locale,
				}),
			);
		}
	}
}

export type TargetRejection = {
	member: GuildMember;
	reason: string;
};

export function partitionNukeTargets(
	members: Collection<string, GuildMember>,
	executorId: Snowflake,
	ignoredRoles: Snowflake[],
	locale: string,
): [GuildMember[], TargetRejection[]] {
	const confirmations = [];
	const rejections = [];

	for (const member of members.values()) {
		const reason = canBan(member, executorId, ignoredRoles, locale);
		if (reason) {
			rejections.push({ member, reason });
		} else {
			confirmations.push(member);
		}
	}

	return [confirmations, rejections];
}

export type IdValidationResult = {
	invalidIdCount: number;
	totalIdCount: number;
	validIdCount: number;
	validMembers: Collection<string, GuildMember>;
};

export async function validateMemberIds(
	interaction: ChatInputCommandInteraction<"cached"> | ModalSubmitInteraction<"cached">,
	ids: Set<Snowflake>,
	locale: string,
): Promise<IdValidationResult> {
	const fetchedMembers = await interaction.guild.members.fetch({ force: true });
	const result = new Collection<string, GuildMember>();

	for (const id of ids) {
		const member = fetchedMembers.get(id);

		if (member) {
			result.set(id, member);
		}
	}

	if (!result.size) {
		throw new Error(i18next.t("command.mod.anti_raid_nuke.common.errors.no_ids", { lng: locale }));
	}

	if (result.size === fetchedMembers.size) {
		throw new Error(i18next.t("command.mod.anti_raid_nuke.common.errors.no_filter", { lng: locale }));
	}

	return {
		validMembers: result,
		validIdCount: result.size,
		invalidIdCount: ids.size - result.size,
		totalIdCount: ids.size,
	};
}

export function parseDate(date?: string | null | undefined) {
	return date ? dayjs(resolveTimestamp(date)).format(DATE_FORMAT_WITH_SECONDS) : undefined;
}
