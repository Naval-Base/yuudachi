import type { ChatInputCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import type { Command, StaticContextArgs } from '../../Command.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { HistoryCommand } from '../../interactions/index.js';
import { generateHistory } from '../../util/generateHistory.js';

export default class implements Command {
	public readonly userContextName = 'History';

	public async executeChatInput(
		interaction: ChatInputCommandInteraction<'cached'>,
		args: ArgumentsOf<typeof HistoryCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		const embed = await generateHistory(interaction, args.user, locale);

		await interaction.editReply({
			embeds: [embed],
		});
	}

	public async executeUserContext(
		interaction: UserContextMenuCommandInteraction<'cached'>,
		args: StaticContextArgs<'user'>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const embed = await generateHistory(interaction, args, locale);

		await interaction.editReply({
			embeds: [embed],
		});
	}
}
