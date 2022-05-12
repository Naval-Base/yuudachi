import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { GuildMember } from 'discord.js';

dayjs.extend(relativeTime);

export function generateTargetInformation(member: GuildMember) {
	return `${member.user.tag} (${member.id})`;
}
