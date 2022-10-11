import type { Message, User } from "discord.js";
import { inlineCode, userMention } from "discord.js";
import i18next from "i18next";
import { ReportStatus } from "../reports/createReport.js";
import { getReportByTarget } from "../reports/getReport.js";
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
	locale: string,
): Promise<void> {
	const [report] = await getReportByTarget(message.guild!.id, message.author.id);

	if (!report || !report.logPostId) {
		throw new Error(i18next.t("log.report_log.forward.errors.generic", { lng: locale }));
	}

	if (report.status !== ReportStatus.Pending) {
		throw new Error(i18next.t("log.report_log.forward.errors.already_resolved", { lng: locale }));
	}

	const channel = checkReportForum(
		message.guild,
		await getGuildSetting(message.guild.id, SettingsKeys.ReportChannelId),
	);
	if (!channel) {
		throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
	}

	const thread = await channel.threads.fetch(report.logPostId);
	if (!thread) {
		throw new Error(i18next.t("log.report_log.forward.errors.generic", { lng: locale }));
	}

	await thread.send({
		content: i18next.t("log.report_log.forward.content", {
			author: `${userMention(author.id)} - \`${author.tag}\` (${author.id})`,
			reason: inlineCode(reason || i18next.t("log.report_log.forward.no_reason", { lng: locale })),
			lng: locale,
		}),
		embeds: [formatMessageToEmbed(message, locale)],
		allowedMentions: {
			parse: [],
		},
	});
}
