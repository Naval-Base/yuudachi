import type { Message, User } from "discord.js";
import { inlineCode, userMention } from "discord.js";
import i18next from "i18next";
import type { Report } from "../reports/createReport.js";
import { updateReport } from "../reports/updateReport.js";
import { checkReportForum } from "../settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { formatMessageToEmbed } from "./formatMessageToEmbed.js";

type ForwardReportData = {
	author: User;
	reason: string;
};

export async function forwardReport(
	{ author, reason }: ForwardReportData,
	message: Message<true>,
	report: Report,
	locale: string,
): Promise<void> {
	const channel = checkReportForum(
		message.guild,
		await getGuildSetting(message.guild.id, SettingsKeys.ReportChannelId),
	);

	const thread = await channel!.threads.fetch(report.logPostId!);

	await updateReport({
		reportId: report.reportId,
		guildId: report.guildId,
		contextMessagesIds: [...report.contextMessagesIds, message.id],
	});

	await thread!.send({
		content: i18next.t("log.report_log.forward.content", {
			author: `${userMention(author.id)} - \`${author.tag}\` (${author.id})`,
			reason: inlineCode(reason),
			lng: locale,
		}),
		embeds: [formatMessageToEmbed(message, locale)],
		allowedMentions: {
			parse: [],
		},
	});
}
