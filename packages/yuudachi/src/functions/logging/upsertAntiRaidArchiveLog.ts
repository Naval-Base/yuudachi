import dayjs from 'dayjs';
import { ButtonStyle, ComponentType, type Guild, type User } from 'discord.js';
import i18next from 'i18next';
import { generateAntiRaidNukeReportEmbed } from './generateAntiRaidNukeReportEmbed.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';
import { type FormatterArgs, generateAntiRaidNukeReport } from '../formatters/generateAntiRaidNukeReport.js';
import { generateFormatterUrl } from '../formatters/generateFormatterUrl.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidNukeReport(
	guild: Guild,
	user: User,
	report: AntiRaidNukeResult[],
	args: FormatterArgs,
) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const archiveChannel = await checkLogChannel(
		guild,
		await getGuildSetting(guild.id, SettingsKeys.AntiRaidNukeArchiveChannelId),
	);

	const embed = generateAntiRaidNukeReportEmbed(report.filter((r) => r.success).length, user, locale, args.dryRun);

	const markdown = await generateAntiRaidNukeReport(guild, user, report, args, locale);

	const file = Buffer.from(markdown, 'utf8');

	const reportDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const reportName = `${reportDate}-anti-raid-nuke-report.md`;

	const msg = await archiveChannel!.send({
		embeds: [embed],
		files: [
			{
				name: reportName,
				attachment: file,
			},
		],
	});
	const attachment = msg.attachments.first();

	if (!attachment) return;

	const resolvedMsg = await msg.edit({
		components: [
			createMessageActionRow([
				{
					type: ComponentType.Button,
					style: ButtonStyle.Link,
					url: generateFormatterUrl(attachment.url),
					label: i18next.t('command.mod.anti_raid_nuke.common.buttons.formatted', { lng: locale }),
				},
			]),
		],
	});

	return resolvedMsg;
}
