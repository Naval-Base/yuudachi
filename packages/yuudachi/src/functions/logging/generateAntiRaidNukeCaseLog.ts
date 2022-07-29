import { Formatters } from 'discord.js';
import i18next from 'i18next';
import type { Case } from '../cases/createCase.js';

export function generateAntiRaidNukeCaseLog(cases: Case[], reason: string, locale: string) {
	return i18next.t('log.mod_log.anti_raid_nuke.description', {
		reason,
		members: cases.length,
		joined_after: Formatters.time(new Date(cases[0]!.joinCutoff!), Formatters.TimestampStyles.LongDateTime),
		account_created_after: Formatters.time(new Date(cases[0]!.accountCutoff!), Formatters.TimestampStyles.LongDateTime),
		lng: locale,
	});
}
