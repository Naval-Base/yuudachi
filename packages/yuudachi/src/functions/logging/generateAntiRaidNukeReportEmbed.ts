import type { User } from 'discord.js';
import i18next from 'i18next';
import { addFields } from '../../util/embed.js';

export function generateAntiRaidNukeReportEmbed(hitCount: number, user: User, locale: string) {
	return addFields({
		title: i18next.t('log.general_log.anti_raid_nuke.title', { lng: locale }),
		description: i18next.t('log.general_log.anti_raid_nuke.description', {
			author: `${user.tag} (${user.id})`,
			count: hitCount,
			lng: locale,
		}),
		color: 3407871,
	});
}
