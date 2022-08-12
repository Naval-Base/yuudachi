import { type Snowflake, time, TimestampStyles, hyperlink } from 'discord.js';
import i18next from 'i18next';
import type { Case } from '../cases/createCase.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function generateAntiRaidNukeCaseLog(
	guildId: Snowflake,
	cases: Case[],
	reason: string,
	messageUrl?: string | undefined | null,
) {
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);

	const msg = [
		i18next.t('log.mod_log.anti_raid_nuke.description', {
			reason,
			count: cases.length,
			lng: locale,
		}),
	];

	if (cases[0]?.joinCutoff && cases[0]?.accountCutoff) {
		msg.push(
			i18next.t('log.mod_log.anti_raid_nuke.parameters.cutoff', {
				joined_after: time(new Date(cases[0].joinCutoff), TimestampStyles.LongDateTime),
				account_created_after: time(new Date(cases[0].accountCutoff), TimestampStyles.LongDateTime),
				lng: locale,
			}),
		);
	}

	if (messageUrl) {
		msg.push(
			i18next.t('log.mod_log.anti_raid_nuke.report', {
				link: hyperlink(i18next.t('log.mod_log.anti_raid_nuke.report_sub', { lng: locale }), messageUrl),
				lng: locale,
			}),
		);
	}

	return msg.join('\n');
}
