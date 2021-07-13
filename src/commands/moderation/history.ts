import type { CommandInteraction } from 'discord.js';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { HistoryCommand } from '../../interactions';
import { checkModRole } from '../../util/checkModRole';
import { generateHistory } from '../../util/generateHistory';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof HistoryCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: args.hide });
		await checkModRole(interaction, locale);

		const embed = await generateHistory(interaction, args.user);

		await interaction.editReply({
			// @ts-expect-error
			embeds: [embed],
		});
	}
}
