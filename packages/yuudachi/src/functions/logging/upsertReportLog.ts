import type { APIEmbed, Embed, Guild, Message, User } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { formatMessageToEmbed } from './formatMessageToEmbed.js';
import { generateReportEmbed } from './generateReportEmbed.js';
import { kSQL } from '../../tokens.js';
import { resolveMessage } from '../../util/resolveMessage.js';
import type { Report } from '../reports/createReport.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export async function upsertReportLog(guild: Guild, user: User, report: Report, message?: Message) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const reportLogChannel = checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ReportChannelId));
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

	if (!message && report.messageId) {
		message = await resolveMessage(reportLogChannel!.id, report.guildId, report.channelId, report.messageId, locale);
	}

	const embeds: (APIEmbed | Embed)[] = [await generateReportEmbed(user, report, locale, message)];
	if (message) {
		embeds.push(formatMessageToEmbed(message as Message<true>, locale));
	}

	if (report.logMessageId) {
		const logMessage = await reportLogChannel!.messages.fetch(report.logMessageId);

		if (logMessage.embeds.length > 1 && embeds.length < 2) {
			embeds.push(logMessage.embeds[1]!);
		}

		await logMessage.edit({
			embeds,
		});
	} else {
		const logMessage = await reportLogChannel!.send({
			embeds,
		});

		await sql`update reports
			set log_message_id = ${logMessage.id}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId}`;
	}
}
