import type { GuildMember } from 'discord.js';

export function generateTargetInformation(member: GuildMember) {
	return `${member.user.tag} (${member.id})`;
}
