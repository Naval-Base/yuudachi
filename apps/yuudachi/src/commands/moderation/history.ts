import { Command, truncateEmbed } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import type { HistoryCommand, HistoryUserContextCommand } from "../../interactions/index.js";
import { generateHistory, HistoryType } from "../../util/generateHistory.js";

type HistoryCommandArgs =
	| ArgsParam<typeof HistoryCommand>["cases"]
	| ArgsParam<typeof HistoryCommand>["reports"]
	| ArgsParam<typeof HistoryUserContextCommand>;
export default class extends Command<typeof HistoryCommand | typeof HistoryUserContextCommand> {
	public constructor() {
		super(["history", "History"]);
	}

	private async handle(
		interaction: InteractionParam | InteractionParam<CommandMethod.UserContext>,
		args: HistoryCommandArgs,
		type: HistoryType,
		locale: LocaleParam,
	): Promise<void> {
		const embed = truncateEmbed(await generateHistory(interaction, args.user, locale, type));

		await interaction.editReply({
			embeds: [embed],
		});
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof HistoryCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.cases?.hide ?? args.reports?.hide ?? true });

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (Object.keys(args)[0]) {
			case "cases": {
				await this.handle(interaction, args.cases, HistoryType.Case, locale);
				break;
			}

			case "reports": {
				await this.handle(interaction, args.reports, HistoryType.Report, locale);
				break;
			}

			default: {
				break;
			}
		}
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof HistoryUserContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		await this.handle(interaction, args, HistoryType.Case, locale);
	}
}
