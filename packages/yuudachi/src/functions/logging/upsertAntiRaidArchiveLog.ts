import dayjs from 'dayjs';
import type { Guild, User } from 'discord.js';
import i18next from 'i18next';
import { formatAntiRaidResultsToAttachment } from './formatMembersToAttachment.js';
import { generateAntiRaidNukeReportEmbed } from './generateAntiRaidNukeReportEmbed.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidNukeReport(
	guild: Guild,
	user: User,
	results: AntiRaidNukeResult[],
	dryRun = false,
) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const archiveChannel = await checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.AntiRaidArchive));

	if (!archiveChannel) {
		throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
	}

	const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const successResults = results.filter((r) => r.success);
	const embed = generateAntiRaidNukeReportEmbed(successResults.length, user, locale, dryRun);

	await archiveChannel.send({
		embeds: [embed],
		files: [
			{
				name: `${membersHitDate}-anti-raid-nuke-hits.txt`,
				attachment: Buffer.from(formatAntiRaidResultsToAttachment(results, locale)),
			},
		],
	});
}
