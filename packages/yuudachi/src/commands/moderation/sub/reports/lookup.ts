import { kSQL, truncateEmbed, container } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import type { Message } from "discord.js";
import i18next from "i18next";
import type { Sql } from "postgres";
import { OP_DELIMITER } from "../../../../Constants.js";
import { formatMessageToEmbed } from "../../../../functions/logging/formatMessageToEmbed.js";
import { generateReportEmbed } from "../../../../functions/logging/generateReportEmbed.js";
import { ReportType } from "../../../../functions/reports/createReport.js";
import { type RawReport, transformReport } from "../../../../functions/reports/transformReport.js";
import type { ReportUtilsCommand } from "../../../../interactions/index.js";
import { generateHistory, generateUserInfo, HistoryType } from "../../../../util/generateHistory.js";
import { resolveMemberAndUser } from "../../../../util/resolveMemberAndUser.js";
import { resolveMessage } from "../../../../util/resolveMessage.js";

export async function lookup(
	interaction: InteractionParam,
	args: ArgsParam<typeof ReportUtilsCommand>["lookup"],
	locale: LocaleParam,
): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);
	const [cmd, id] = args.phrase.split(OP_DELIMITER);

	if (cmd === "history" && id) {
		const data = await resolveMemberAndUser(interaction.guild, id);

		const embed = truncateEmbed(await generateHistory(interaction, data, locale, HistoryType.Report));

		await interaction.editReply({
			embeds: [embed],
		});
		return;
	}

	if (!Number.isNaN(Number.parseInt(args.phrase, 10))) {
		const [report] = await sql<RawReport[]>`
			select *
			from reports
			where guild_id = ${interaction.guildId}
			and report_id = ${args.phrase}
		`;

		if (!report) {
			throw new Error(i18next.t("command.common.errors.use_autocomplete", { lng: locale }));
		}

		let message: Message<true> | null = null;

		try {
			message = report.message_id
				? await resolveMessage(interaction.channelId, report.guild_id, report.channel_id, report.message_id, locale)
				: null;
		} catch {}

		const author = await interaction.client.users.fetch(report.author_id);

		const embeds = [truncateEmbed(await generateReportEmbed(author, transformReport(report), locale, message))];

		if (message) {
			embeds.push(truncateEmbed(formatMessageToEmbed(message, locale)));
		}

		if (report.type === ReportType.User) {
			const target = await resolveMemberAndUser(interaction.guild, report.target_id);
			embeds.push(truncateEmbed(generateUserInfo(target, locale)));
		}

		await interaction.editReply({
			embeds,
		});
		return;
	}

	throw new Error(i18next.t("command.common.errors.use_autocomplete", { lng: locale }));
}
