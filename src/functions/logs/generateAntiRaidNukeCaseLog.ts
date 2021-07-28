import { Formatters } from 'discord.js';
import i18next from 'i18next';

import type { Case } from '../cases/createCase';

export function generateAntiRaidNukeCaseLog(cases: Case[], reason: string, locale: string) {
	const msg = i18next.t('log.mod_log.anti_raid_nuke.description', {
		reason: reason,
		hit_count: cases.length,
		joined_after: Formatters.time(new Date(cases[0].joinCutoff!), Formatters.TimestampStyles.LongDateTime),
		account_created_after: Formatters.time(new Date(cases[0].accountCutoff!), Formatters.TimestampStyles.LongDateTime),
		lng: locale,
	});

	return msg;
}
