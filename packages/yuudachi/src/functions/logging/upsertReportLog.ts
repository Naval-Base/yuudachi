import type { APIEmbed, Embed, Guild, Message } from "discord.js";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import { kSQL } from "../../tokens.js";
import { generateUserInfo } from "../../util/generateHistory.js";
import { resolveMemberAndUser } from "../../util/resolveMemberAndUser.js";
import { resolveMessage } from "../../util/resolveMessage.js";
import { type Report, ReportType } from "../reports/createReport.js";
import { checkLogChannel } from "../settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { formatMessageToEmbed } from "./formatMessageToEmbed.js";
import { generateReportEmbed } from "./generateReportEmbed.js";

export async function upsertReportLog(guild: Guild, report: Report, message?: Message) {
	const sql = container.resolve<Sql<{}>>(kSQL);
	const reportLogChannel = checkLogChannel(guild, await getGuildSetting(guild.id, SettingsKeys.ReportChannelId));
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	let localMessage = message;

	try {
		if (!localMessage && report.messageId) {
			localMessage = await resolveMessage(
				reportLogChannel!.id,
				report.guildId,
				report.channelId!,
				report.messageId,
				locale,
			);
		}
	} catch {}

	const author = await guild.client.users.fetch(report.authorId);

	const embeds: (APIEmbed | Embed)[] = [await generateReportEmbed(author, report, locale, localMessage)];
	if (localMessage) {
		embeds.push(formatMessageToEmbed(localMessage as Message<true>, locale));
	}

	if (report.type === ReportType.User) {
		const target = await resolveMemberAndUser(guild, report.targetId);

		embeds.push(generateUserInfo(target, locale));
	}

	if (report.logMessageId) {
		const logMessage = await reportLogChannel!.messages.fetch(report.logMessageId);

		if (logMessage.embeds.length > 1 && embeds.length < 2) {
			embeds.push(logMessage.embeds[1]!);
		}

		return logMessage.edit({
			embeds,
		});
	}

	const logMessage = await reportLogChannel!.send({
		embeds,
	});

	await sql`
		update reports
					set log_message_id = ${logMessage.id}
					where guild_id = ${report.guildId}
						and report_id = ${report.reportId}
	`;

	return logMessage;
}
