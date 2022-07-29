import { InteractionType } from 'discord-api-types/v10';
import { Client, Events } from 'discord.js';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../Command.js';
import type { Event } from '../Event.js';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting.js';
import { transformInteraction } from '../interactions/InteractionOptions.js';
import { logger } from '../logger.js';
import { kCommands } from '../tokens.js';

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Events.InteractionCreate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Map<string, Command>,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (
				interaction.type !== InteractionType.ApplicationCommand &&
				!interaction.isUserContextMenuCommand() &&
				interaction.type !== InteractionType.ApplicationCommandAutocomplete
			) {
				return;
			}

			if (!interaction.inCachedGuild()) {
				return;
			}

			const command = this.commands.get(interaction.commandName.toLowerCase());
			if (command) {
				try {
					const locale = await getGuildSetting(interaction.guildId, SettingsKeys.Locale);
					const forceLocale = await getGuildSetting<boolean>(interaction.guildId, SettingsKeys.Locale);

					if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
						if (!command.autocomplete) {
							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Received autocomplete for ${interaction.commandName}, but the command does not handle autocomplete`,
							);
							return;
						}
						await command.autocomplete(
							interaction,
							transformInteraction(interaction.options.data),
							forceLocale ? locale : interaction.locale,
						);
					} else {
						logger.info(
							{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
							`Executing command ${interaction.commandName}`,
						);
						await command.execute(
							interaction,
							transformInteraction(interaction.options.data),
							forceLocale ? locale : interaction.locale,
						);
					}
				} catch (e) {
					const error = e as Error;
					logger.error(error, error.message);
					try {
						if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
							return;
						}

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
