import type { APIEmbed, TextChannel, User } from 'discord.js';
import i18next from 'i18next';

export function generateAntiRaidNukeReportEmbed(
	hitCount: number,
	user: User,
	channel: TextChannel,
	locale: string,
): APIEmbed {
	return {
		title: i18next.t('log.general_log.anti_raid_nuke.title', { lng: locale }),
		description: i18next.t('log.general_log.anti_raid_nuke.description', {
			hit_count: hitCount,
			author: `${user.tag} (${user.id})`,
			channel: `${channel.name} (${channel.id})`,
			lng: locale,
		}),
		color: 3407871,
	};
}
