import { Collection, type Snowflake } from "discord.js";
import i18next from "i18next";
import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from "../../Command.js";
import {
	AUTOCOMPLETE_CHOICE_LIMIT,
	AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
	OP_DELIMITER,
	SNOWFLAKE_MIN_LENGTH,
} from "../../Constants.js";
import { ReportType } from "../../functions/reports/createReport.js";
import { findReports } from "../../functions/reports/findReports.js";
import type { ReportUtilsCommand } from "../../interactions/index.js";
import { logger } from "../../logger.js";
import { REPORT_KEYS } from "../../util/actionKeys.js";
import { ellipsis } from "../../util/embed.js";
import { lookup } from "./sub/reports/lookup.js";
import { status } from "./sub/reports/status.js";

export default class extends Command<typeof ReportUtilsCommand> {
	public override async autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		args: ArgsParam<typeof ReportUtilsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		try {
			const trimmedPhrase = args.lookup.phrase.trim();
			const reports = await findReports(trimmedPhrase, interaction.guildId);
			let choices = reports.map((report) => {
				const choiceName = `#${report.report_id} ${report.type === ReportType.Message ? "✉️" : "👤"} ${REPORT_KEYS[
					report.status
				]!.toUpperCase()} ${report.author_tag} ➜ ${report.target_tag}: ${report.reason}`;

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

			if (uniqueTargets.size === 1) {
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

			if (uniqueAuthors.size === 1) {
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
				trimmedPhrase.length >= SNOWFLAKE_MIN_LENGTH
			) {
				const user = interaction.client.users.cache.get(trimmedPhrase);

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

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReportUtilsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		await interaction.deferReply({ ephemeral: args.lookup?.hide ?? true });

		switch (Object.keys(args)[0]) {
			case "lookup":
				await lookup(interaction, args.lookup, locale);
				break;
			case "status":
				await status(interaction, args.status, locale);
				break;
			default:
		}
	}
}
