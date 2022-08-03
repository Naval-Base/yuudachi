import type { User } from 'discord.js';
import i18next from 'i18next';
import { Color } from '../../Constants.js';
import { addFields } from '../../util/embed.js';

export function generateAntiRaidNukeReportEmbed(hitCount: number, user: User, locale: string, dryRun = false) {
	return addFields({
		title: i18next.t('log.general_log.anti_raid_nuke.title', { lng: locale }),
		description: i18next.t('log.general_log.anti_raid_nuke.description', {
			author: `${user.tag} (${user.id})`,
			count: hitCount,
			lng: locale,
		}),
		color: dryRun ? Color.DiscordEmbedBackground : Color.DiscordDanger,
	});
}
