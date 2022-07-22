import dayjs from 'dayjs';
import { ButtonStyle, Client, ComponentType, Snowflake, TextChannel, User } from 'discord.js';
import i18next from 'i18next';
import { container } from 'tsyringe';
import { generateAntiRaidNukeReportEmbed } from './generateAntiRaidNukeReportEmbed.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import type { AntiRaidResult } from '../../commands/moderation/anti-raid-nuke.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';
import { formatReport, ReportArgs } from '../anti-raid/formatReport.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertAntiRaidNukeReport(
	guildId: Snowflake,
	user: User,
	channel: TextChannel,
	report: AntiRaidResult[],
	data: ReportArgs,
) {
	const client = container.resolve<Client<true>>(Client);

	const guild = await client.guilds.fetch(guildId);
	const logChannel = await checkLogChannel(
		guild,
		(await getGuildSetting(guild.id, SettingsKeys.GeneralLogChannelId)) as string,
	);

	const locale = (await getGuildSetting(guild.id, SettingsKeys.Locale)) as string;

	const embed = generateAntiRaidNukeReportEmbed(report.filter((r) => r.success).length, user, channel, locale);

	const file = Buffer.from(formatReport(guild, data, report), 'utf8');

	const reportDate = dayjs().format(DATE_FORMAT_LOGFILE);

	const message = await logChannel!
		.send({
			embeds: [embed],
			files: [
				{
					name: `${reportDate}-anti-raid-nuke-report.md`,
					attachment: file,
				},
			],
		})
		.then(async (msg) => {
			const attachment = msg.attachments.find((a) => a.name === `${reportDate}-anti-raid-nuke-report.md`);

			if (!attachment) return;

			const resolvedMsg = await msg.edit({
				components: [
					createMessageActionRow([
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							url: `https://dev--md-online.jpbm135.autocode.gg/md?url=${attachment.url}`,
							label: i18next.t('command.mod.anti_raid_nuke.buttons.report', { lng: locale }),
						},
					]),
				],
			});

			return resolvedMsg;
		});

	return message;
}
