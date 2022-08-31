import { Buffer } from 'node:buffer';
import dayjs from 'dayjs';
import { ButtonStyle, type Message, type Guild, type User } from 'discord.js';
import type { GuildMember } from 'discord.js';
import i18next from 'i18next';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import type { TargetRejection } from '../../commands/moderation/sub/anti-raid-nuke/utils.js';
import { createButton } from '../../util/button.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';
import type { Case } from '../cases/createCase.js';
import { type FormatterArgs, generateAntiRaidNukeReport } from '../formatters/generateAntiRaidNukeReport.js';
import { generateFormatterUrl } from '../formatters/generateFormatterUrl.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';
import { generateAntiRaidNukeEmbed } from './generateAntiRaidNukeEmbed.js';

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
	executor: User,
	message: Message,
	successes: GuildMember[],
	failures: TargetRejection[],
	cases: Case[],
	args: FormatterArgs,
) {
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const embed = generateAntiRaidNukeEmbed(successes.length, executor, locale);
	const report = await generateAntiRaidNukeReport(guild, executor, successes, failures, cases, args);

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
