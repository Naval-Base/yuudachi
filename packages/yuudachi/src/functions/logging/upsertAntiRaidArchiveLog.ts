import dayjs from 'dayjs';
import { ButtonStyle, type Message, type Guild, type User } from 'discord.js';
import i18next from 'i18next';
import { generateAntiRaidNukeEmbed } from './generateAntiRaidNukeEmbed.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import { createButton } from '../../util/button.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';
import type { Case } from '../cases/createCase.js';
import { type FormatterArgs, generateAntiRaidNukeReport } from '../formatters/generateAntiRaidNukeReport.js';
import { generateFormatterUrl } from '../formatters/generateFormatterUrl.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidArchivePendingLog(guild: Guild) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const archiveChannel = checkLogChannel(
		guild,
		await getGuildSetting(guild.id, SettingsKeys.AntiRaidNukeArchiveChannelId),
	);

	return archiveChannel!.send(i18next.t('log.anti_raid_nuke.pending', { lng: locale }));
}

export async function upsertAntiRaidArchiveLog(
	guild: Guild,
	user: User,
	message: Message,
	result: AntiRaidNukeResult[],
	cases: Case[],
	args: FormatterArgs,
) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

	const embed = generateAntiRaidNukeEmbed(result.filter((r) => r.success).length, user, args.dryRun, locale);

	const report = await generateAntiRaidNukeReport(guild, user, result, cases, args);

	const msg = await message.edit({
		content: null,
		embeds: [embed],
		files: [
			{
				name: `${dayjs().format(DATE_FORMAT_LOGFILE)}-anti-raid-nuke-report.md`,
				attachment: Buffer.from(report, 'utf8'),
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
				createButton({
					label: i18next.t('command.mod.anti_raid_nuke.common.buttons.formatted', { lng: locale }),
					style: ButtonStyle.Link,
					url: generateFormatterUrl(attachment.url),
				}),
			]),
		],
	});
}
