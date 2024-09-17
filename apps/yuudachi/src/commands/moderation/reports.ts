import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { handleReportAutocomplete } from "../../functions/autocomplete/reports.js";
import type { ReportUtilsCommand } from "../../interactions/index.js";
import { lookup } from "./sub/reports/lookup.js";
import { status } from "./sub/reports/status.js";
import { updateRestrictionLevel } from "./sub/reports/update-restricition-level.js";

export default class extends Command<typeof ReportUtilsCommand> {
	public override async autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		_: ArgsParam<typeof ReportUtilsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await handleReportAutocomplete(interaction, locale, true);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReportUtilsCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.lookup?.hide ?? true });

		switch (Object.keys(args)[0]) {
			case "lookup":
				await lookup(interaction, args.lookup, locale);
				break;
			case "status":
				await status(interaction, args.status, locale);
				break;
			case "update-restriction-level":
				await updateRestrictionLevel(interaction, args["update-restriction-level"], locale);
				break;
			default:
		}
	}
}
