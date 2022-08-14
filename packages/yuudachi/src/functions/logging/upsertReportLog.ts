import type { Guild, Message, User } from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';
import type { Report } from '../reports/createReport.js';
import { checkLogChannel } from '../settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';
import { formatMessageToEmbed } from './formatMessageToEmbed.js';
import { generateReportEmbed } from './generateReportEmbed.js';

export async function upsertReportLog(guild: Guild, user: User, report: Report, message?: Message<boolean>) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const modLogChannel = checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ReportChannelId));
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

	const embeds = [await generateReportEmbed(user, report, locale, message)];
	if (message) {
		embeds.push(formatMessageToEmbed(message as Message<true>, locale));
	}

	if (report.logMessageId) {
		const message = await modLogChannel!.messages.fetch(report.logMessageId);
		await message.edit({
			embeds,
		});
	} else {
		const logMessage = await modLogChannel!.send({
			embeds,
		});

		await sql`update reports
			set log_message_id = ${logMessage.id}
			where guild_id = ${report.guildId}
				and report_id = ${report.reportId}`;
	}
}
