import { type ArgsParam, Command, type InteractionParam, type LocaleParam, type CommandMethod } from '../../Command.js';
import type { HistoryCommand, HistoryContextMenuCommand } from '../../interactions/index.js';
import { generateHistory } from '../../util/generateHistory.js';

export default class extends Command<typeof HistoryCommand | typeof HistoryContextMenuCommand> {
	public constructor() {
		super(['history', 'History']);
	}

	private async handle(
		interaction: InteractionParam | InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof HistoryCommand | typeof HistoryContextMenuCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const embed = await generateHistory(interaction, args.user, locale);

		await interaction.editReply({
			embeds: [embed],
		});
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof HistoryCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });
		await this.handle(interaction, args, locale);
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof HistoryContextMenuCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		await this.handle(interaction, args, locale);
	}
}
