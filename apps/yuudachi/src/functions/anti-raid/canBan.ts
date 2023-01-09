import { type GuildMember, PermissionFlagsBits, type Snowflake } from "discord.js";
import i18next from "i18next";

export function canBan(target: GuildMember, executorId: Snowflake, ignoreRoles: string[], locale: string) {
	if (target.id === executorId) {
		return i18next.t(`command.mod.anti_raid_nuke.common.errors.result.reject_self`, { lng: locale });
	}

	if (!target.bannable) {
		return i18next.t(`command.mod.anti_raid_nuke.common.errors.result.reject_unbanable`, { lng: locale });
	}

	if (target.user.bot) {
		return i18next.t(`command.mod.anti_raid_nuke.common.errors.result.reject_bot`, { lng: locale });
	}

	if (target.roles.cache.hasAny(...ignoreRoles)) {
		return i18next.t(`command.mod.anti_raid_nuke.common.errors.result.reject_protected`, { lng: locale });
	}

	if (
		target.permissions.any([
			PermissionFlagsBits.Administrator,
			PermissionFlagsBits.BanMembers,
			PermissionFlagsBits.KickMembers,
			PermissionFlagsBits.ModerateMembers,
			PermissionFlagsBits.ManageChannels,
			PermissionFlagsBits.ManageEvents,
			PermissionFlagsBits.ManageGuild,
		])
	) {
		return i18next.t(`command.mod.anti_raid_nuke.common.errors.result.reject_perms`, { lng: locale });
	}

	return null;
}
