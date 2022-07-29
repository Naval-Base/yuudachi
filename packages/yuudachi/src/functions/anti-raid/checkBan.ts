import { GuildMember, PermissionFlagsBits } from 'discord.js';

enum BanRejectReasons {
	Self = 'reject_self',
	MemberUnbanable = 'reject_unbanable',
	MemberIsBot = 'reject_bot',
	HasAutomodIgnoreRole = 'reject_protected',
	HasHigherPerms = 'reject_perms',
}

export function checkBan(member: GuildMember, authorId: string, ignoreRolesId: string[]): BanRejectReasons | null {
	if (member.id === authorId) {
		return BanRejectReasons.Self;
	}

	if (!member.bannable) {
		return BanRejectReasons.MemberUnbanable;
	}

	if (member.user.bot) {
		return BanRejectReasons.MemberIsBot;
	}

	if (member.roles.cache.hasAny(...ignoreRolesId)) {
		return BanRejectReasons.HasAutomodIgnoreRole;
	}

	if (
		member.permissions.any([
			PermissionFlagsBits.Administrator,
			PermissionFlagsBits.BanMembers,
			PermissionFlagsBits.KickMembers,
			PermissionFlagsBits.ModerateMembers,
			PermissionFlagsBits.ManageChannels,
			PermissionFlagsBits.ManageEvents,
			PermissionFlagsBits.ManageGuild,
		])
	) {
		return BanRejectReasons.HasHigherPerms;
	}

	return null;
}
