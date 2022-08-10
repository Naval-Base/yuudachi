import dayjs from 'dayjs';
import type { Guild, User } from 'discord.js';
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
	const archiveChannel = await checkLogChannel(
		guild,
		await getGuildSetting(guild.id, SettingsKeys.AntiRaidNukeArchiveChannelId),
	);

	const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const embed = generateAntiRaidNukeReportEmbed(results.length, user, locale, dryRun);

	await archiveChannel!.send({
		embeds: [embed],
		files: [
			{
				name: `${membersHitDate}-anti-raid-nuke-hits.txt`,
				attachment: Buffer.from(formatAntiRaidResultsToAttachment(results, locale)),
			},
		],
	});
}
