import { GuildMember, PermissionFlagsBits } from 'discord.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

enum BanRejectReason {
	Self = 'reject_self',
	TargetUnbanable = 'reject_unbanable',
	TargetIsBot = 'reject_bot',
	HasAutomodIgnoreRole = 'reject_protected',
	HasHigherPerms = 'reject_perms',
}

export async function canBan(guildId: string, target: GuildMember, userId: string): Promise<BanRejectReason | null> {
	const ignoreRoles = await getGuildSetting<string[]>(guildId, SettingsKeys.AutomodIgnoreRoles);

	if (target.id === userId) {
		return BanRejectReason.Self;
	}

	if (!target.bannable) {
		return BanRejectReason.TargetUnbanable;
	}

	if (target.user.bot) {
		return BanRejectReason.TargetIsBot;
	}

	if (target.roles.cache.hasAny(...ignoreRoles)) {
		return BanRejectReason.HasAutomodIgnoreRole;
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
		return BanRejectReason.HasHigherPerms;
	}

	return null;
}
