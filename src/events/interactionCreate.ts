import { type Client, Constants } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../Command';
import type { Event } from '../Event';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting';
import { transformInteraction } from '../interactions/InteractionOptions';
import { logger } from '../logger';
import { kCommands } from '../tokens';

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Constants.Events.INTERACTION_CREATE;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Map<string, Command>,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (!interaction.isCommand() && !interaction.isContextMenu()) {
				return;
			}

			if (!interaction.inCachedGuild()) {
				return;
			}

			const command = this.commands.get(interaction.commandName.toLowerCase());
			if (command) {
				try {
					logger.info(
						{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
						`Executing command ${interaction.commandName}`,
					);

					const locale = (await getGuildSetting(interaction.guildId, SettingsKeys.Locale)) as string | undefined;
					await command.execute(interaction, transformInteraction(interaction.options.data), locale ?? 'en');
				} catch (e) {
					const error = e as Error;
					logger.error(error, error.message);
					try {
						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								'Command interaction has not been deferred before throwing',
							);
							await interaction.deferReply();
						}

						await interaction.editReply({ content: error.message, components: [] });
					} catch (err) {
						const error = err as Error;
						logger.error(error, error.message);
					}
				}
			}
		});
	}
}
