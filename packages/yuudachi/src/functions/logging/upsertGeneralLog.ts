import type { Guild, User } from 'discord.js';
import i18next from 'i18next';
import { generateAntiRaidNukeReportEmbed } from './generateAntiRaidNukeReportEmbed.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidNukeReport(guild: Guild, user: User, report: AntiRaidNukeResult[]) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const logChannel = await checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.AntiRaidArchive));
	if (!logChannel) {
		throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
	}

	const embed = generateAntiRaidNukeReportEmbed(report.filter((r) => r.success).length, user, locale);

	await logChannel.send({
		embeds: [embed],
	});
}
