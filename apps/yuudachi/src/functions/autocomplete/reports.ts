import {
	ellipsis,
	AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
	SNOWFLAKE_MIN_LENGTH,
	AUTOCOMPLETE_CHOICE_LIMIT,
	logger,
} from "@yuudachi/framework";
import type { LocaleParam } from "@yuudachi/framework/types";
import type { Snowflake } from "discord.js";
import { type AutocompleteInteraction, Collection } from "discord.js";
import i18next from "i18next";
import { OP_DELIMITER } from "../../Constants.js";
import { reportStatusLabel } from "../../util/actionKeys.js";
import { ReportType, type ReportStatus } from "../reports/createReport.js";
import { findReports } from "../reports/findReports.js";

export async function handleReportAutocomplete(
	interaction: AutocompleteInteraction<"cached">,
	locale: LocaleParam,
	allowHistory = false,
) {
	try {
		const trimmedPhrase = interaction.options.getFocused().trim();
		const reports = await findReports(trimmedPhrase, interaction.guildId);
		let choices = reports.map((report) => {
			const choiceName = `#${report.report_id} ${report.type === ReportType.Message ? "✉️" : "👤"} ${reportStatusLabel(
				report.status as ReportStatus,
				locale,
			).toUpperCase()} ${report.author_tag} ➜ ${report.target_tag}: ${report.reason}`;

			return {
				name: ellipsis(choiceName, AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT),
				value: String(report.report_id),
			} as const;
		});

		const uniqueTargets = new Collection<string, { id: Snowflake; tag: string }>();
		const uniqueAuthors = new Collection<string, { id: Snowflake; tag: string }>();

		for (const report of reports) {
			if (!uniqueTargets.has(report.target_id)) {
				uniqueTargets.set(report.target_id, { id: report.target_id, tag: report.target_tag });
			}

			if (!uniqueAuthors.has(report.author_id)) {
				uniqueAuthors.set(report.author_id, { id: report.author_id, tag: report.author_tag });
			}
		}

		let historyAdded = false;

		if (uniqueTargets.size === 1 && allowHistory) {
			const target = uniqueTargets.first()!;
			choices = [
				{
					name: ellipsis(
						i18next.t("command.mod.reports.autocomplete.show_history_target", {
							user: target.tag,
							lng: locale,
						})!,
						AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
					),
					value: `history${OP_DELIMITER}${target.id}`,
				},
				...choices,
			];
			historyAdded = true;
		}

		if (uniqueAuthors.size === 1 && allowHistory) {
			const author = uniqueAuthors.first()!;
			choices = [
				{
					name: ellipsis(
						i18next.t("command.mod.reports.autocomplete.show_history_author", {
							user: author.tag,
							lng: locale,
						})!,
						AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
					),
					value: `history${OP_DELIMITER}${author.id}`,
				},
				...choices,
			];
			historyAdded = true;
		}

		if (
			!historyAdded &&
			!Number.isNaN(Number.parseInt(trimmedPhrase, 10)) &&
			trimmedPhrase.length >= SNOWFLAKE_MIN_LENGTH &&
			allowHistory
		) {
			const user = await interaction.client.users.fetch(trimmedPhrase);

			if (user) {
				choices = [
					{
						name: ellipsis(
							i18next.t("command.mod.reports.autocomplete.show_history_target", {
								user: user.tag,
								lng: locale,
							})!,
							AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
						),
						value: `history${OP_DELIMITER}${user.id}`,
					},
					...choices,
				];
			}
		}

		await interaction.respond(choices.slice(0, AUTOCOMPLETE_CHOICE_LIMIT));
	} catch (error_) {
		const error = error_ as Error;
		logger.error(error, error.message);
	}
}
