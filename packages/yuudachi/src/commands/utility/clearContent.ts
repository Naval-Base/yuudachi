import clean from '@aero/sanitizer';
import { codeBlock, MessageContextMenuCommandInteraction } from 'discord.js';
import type { Command, StaticContextArgs } from '../../Command.js';

export default class implements Command {
	public readonly messageContextName = 'Clear message content';

	public async executeMessageContext(
		interaction: MessageContextMenuCommandInteraction<'cached'>,
		args: StaticContextArgs<'message'>,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		await interaction.editReply({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
			content: codeBlock(clean(args.message.content)),
		});
	}
}
