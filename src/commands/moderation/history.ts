import type { CommandInteraction } from 'discord.js';
import type { Command } from '../../Command.js';
import { checkModRole } from '../../functions/permissions/checkModRole.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { HistoryCommand } from '../../interactions/index.js';
import { generateHistory } from '../../util/generateHistory.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof HistoryCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });
		await checkModRole(interaction, locale);

		const embed = await generateHistory(interaction, args.user, locale);

		await interaction.editReply({
			embeds: [embed],
		});
	}
}
