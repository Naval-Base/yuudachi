import { GuildMember, PermissionFlagsBits } from 'discord.js';

export function checkBan(member: GuildMember, authorId: string, modRoleId: string): string | null {
	if (member.id === authorId) return 'reject_self';
	if (!member.bannable) return 'reject_unbannable';
	if (member.user.bot) return 'reject_bot';
	if (member.roles.cache.has(modRoleId)) return 'reject_mod';
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
	)
		return 'reject_perms';
	return null;
}
