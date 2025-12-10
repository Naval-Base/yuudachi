import { createMessageActionRow } from "@yuudachi/framework";
import type { APIEmbed, Attachment, AttachmentPayload, Guild, User } from "discord.js";
import { codeBlock, Message } from "discord.js";
import i18next from "i18next";
import { Color } from "../../Constants.js";
import { createMessageLinkButton } from "../../util/createMessageLinkButton.js";
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

	const isMessage = payload instanceof Message;
	const embeds: APIEmbed[] = [
		{
			author: {
				name: `${author.tag} (${author.id})`,
				icon_url: author.displayAvatarURL(),
			},
			description: i18next.t("log.report_log.reason", {
				reason: codeBlock(reason),
				lng: locale,
			}),
			footer: {
				text: i18next.t(`log.report_log.forward.${isMessage ? "message" : "user"}`, {
					lng: locale,
				}),
			},
			timestamp: new Date().toISOString(),
			color: Color.DiscordPrimary,
		},
	];

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
		embeds,
		components: isMessage ? [createMessageActionRow([createMessageLinkButton(payload as Message<true>, locale)])] : [],
		allowedMentions: {
			parse: [],
		},
	});
}
