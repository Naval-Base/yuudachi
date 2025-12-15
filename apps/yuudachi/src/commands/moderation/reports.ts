import { injectable } from "@needle-di/core";
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { MessageFlags } from "discord.js";
import { handleReportAutocomplete } from "../../functions/autocomplete/reports.js";
import type { ReportUtilsCommand } from "../../interactions/index.js";
import { lookup } from "./sub/reports/lookup.js";
import { status } from "./sub/reports/status.js";

@injectable()
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
		await interaction.deferReply({ flags: args.lookup?.hide ? MessageFlags.Ephemeral : undefined });

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
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
