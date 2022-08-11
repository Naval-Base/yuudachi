import dayjs from 'dayjs';
import { ButtonStyle, ComponentType, Message, type Guild, type User } from 'discord.js';
import i18next from 'i18next';
import { generateAntiRaidNukeReportEmbed } from './generateAntiRaidNukeReportEmbed.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';
import type { Case } from '../cases/createCase.js';
import { type FormatterArgs, generateAntiRaidNukeReport } from '../formatters/generateAntiRaidNukeReport.js';
import { generateFormatterUrl } from '../formatters/generateFormatterUrl.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidNukePending(guild: Guild) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const archiveChannel = await checkLogChannel(
		guild,
		await getGuildSetting(guild.id, SettingsKeys.AntiRaidNukeArchiveChannelId),
	);

	if (!archiveChannel) {
		throw new Error(i18next.t('common.errors.no_anti_raid_archive_channel', { lng: locale }));
	}

	return archiveChannel.send(i18next.t('log.general_log.anti_raid_nuke.pending', { lng: locale }));
}

export async function upsertAntiRaidNukeReport(
	guild: Guild,
	user: User,
	message: Message,
	report: AntiRaidNukeResult[],
	cases: Case[],
	args: FormatterArgs,
) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

	const embed = generateAntiRaidNukeReportEmbed(report.filter((r) => r.success).length, user, locale, args.dryRun);

	const markdown = await generateAntiRaidNukeReport(guild, user, report, cases, args, locale);

	const msg = await message.edit({
		content: null,
		embeds: [embed],
		files: [
			{
				name: `${dayjs().format(DATE_FORMAT_LOGFILE)}-anti-raid-nuke-report.md`,
				attachment: Buffer.from(markdown, 'utf8'),
			},
		],
	});

	const attachment = msg.attachments.first();

	if (!attachment) {
		return msg;
	}

	return msg.edit({
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
}
