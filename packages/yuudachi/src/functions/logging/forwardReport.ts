import type { APIEmbed, Attachment, AttachmentPayload, Guild, User } from "discord.js";
import { inlineCode, userMention, Message } from "discord.js";
import i18next from "i18next";
import { Color } from "../../Constants.js";
import type { Report } from "../reports/createReport.js";
import { updateReport } from "../reports/updateReport.js";
import { checkReportForum } from "../settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../settings/getGuildSetting.js";
import { formatMessageToEmbed } from "./formatMessageToEmbed.js";

type ForwardReportData = {
	author: User;
	reason: string;
};

export type forwardPayload = {
	attachments?: AttachmentPayload;
	message?: Message;
};

export async function forwardReport(
	{ author, reason }: ForwardReportData,
	guild: Guild,
	payload: Attachment | Message<true>,
	report: Report,
	locale: string,
): Promise<void> {
	const channel = checkReportForum(guild, await getGuildSetting(guild.id, SettingsKeys.ReportChannelId));

	const thread = await channel!.threads.fetch(report.logPostId!);

	if (!thread) {
		throw new Error(i18next.t("log.report_log.forward.errors.no_thread", { lng: locale }));
	}

	const embeds: APIEmbed[] = [];
	const isMessage = payload instanceof Message;

	if (isMessage) {
		await updateReport({
			reportId: report.reportId,
			guildId: report.guildId,
			contextMessagesIds: [...report.contextMessagesIds, payload.id],
		});

		embeds.push(formatMessageToEmbed(payload, locale));
	} else {
		embeds.push({
			image: {
				url: payload.url,
			},
			color: Color.DiscordEmbedBackground,
		});
	}

	await thread.send({
		content: i18next.t(`log.report_log.forward.${isMessage ? "message" : "user"}`, {
			author: `${userMention(author.id)} - \`${author.tag}\` (${author.id})`,
			reason: inlineCode(reason),
			lng: locale,
		}),
		embeds,
		allowedMentions: {
			parse: [],
		},
	});
}
