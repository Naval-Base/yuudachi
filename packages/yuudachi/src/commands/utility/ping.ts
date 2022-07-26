import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Command } from '../../Command.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { PingCommand } from '../../interactions/index.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof PingCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: args.hide ?? true });

		await interaction.editReply({
			content: i18next.t('command.utility.ping.success', { lng: locale }),
		});
	}
}
