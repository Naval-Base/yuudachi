import { type Snowflake, hyperlink } from 'discord.js';
import i18next from 'i18next';
import type { Case } from '../cases/createCase.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function generateAntiRaidNukeCaseLog(
	guildId: Snowflake,
	cases: Case[],
	reason: string,
	messageUrl?: string | null | undefined,
) {
	const locale = await getGuildSetting(guildId, SettingsKeys.Locale);

	const msg = [
		i18next.t('log.mod_log.anti_raid_nuke.description', {
			reason,
			count: cases.length,
			lng: locale,
		}),
	];

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
