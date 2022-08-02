import { AutocompleteInteraction, Client, Collection, CommandInteraction, Events, InteractionType } from 'discord.js';
import i18next from 'i18next';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../Command.js';
import type { Event } from '../Event.js';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting.js';
import {
	transformInteraction,
	transformMessageContext,
	transformUserContext,
} from '../interactions/InteractionOptions.js';
import { logger } from '../logger.js';
import { kCommands } from '../tokens.js';

function unexpectedInteractionType(
	interaction: CommandInteraction<'cached'> | AutocompleteInteraction,
	type: string,
): never {
	logger.info(
		{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
		`Received ${type} for ${interaction.commandName}, but the command does not handle ${type}`,
	);
	throw new Error(i18next.t('common.errors.unexpected_interaction', { type }));
}

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Events.InteractionCreate as const;

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Collection<string, Command>,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (
				interaction.type !== InteractionType.ApplicationCommand &&
				!interaction.isContextMenuCommand() &&
				interaction.type !== InteractionType.ApplicationCommandAutocomplete
			) {
				return;
			}

			if (!interaction.inCachedGuild()) {
				return;
			}

			const { commandName } = interaction;

			const command =
				this.commands.get(commandName.toLowerCase()) ??
				this.commands.find(
					(c) => commandName === c.name || commandName === c.userContextName || commandName === c.messageContextName,
				);

			if (command) {
				try {
					const locale = await getGuildSetting(interaction.guildId, SettingsKeys.Locale);
					const forceLocale = await getGuildSetting<boolean>(interaction.guildId, SettingsKeys.ForceLocale);

					const effectiveLocale = forceLocale ? locale : interaction.locale;

					if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
						if (!command.autocomplete) {
							unexpectedInteractionType(interaction, 'autocomplete');
						}

						await command.autocomplete(interaction, transformInteraction(interaction.options.data), effectiveLocale);
					} else if (interaction.isUserContextMenuCommand()) {
						if (!command.executeUserContext) {
							unexpectedInteractionType(interaction, 'UserContext');
						}

						await command.executeUserContext(
							interaction,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							transformUserContext(interaction),
							effectiveLocale,
						);
					} else if (interaction.isMessageContextMenuCommand()) {
						if (!command.executeMessageContext) {
							unexpectedInteractionType(interaction, 'MessageContext');
						}

						await command.executeMessageContext(
							interaction,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							transformMessageContext(interaction),
							effectiveLocale,
						);
					} else {
						if (!command.executeChatInput) {
							unexpectedInteractionType(interaction, 'ChatInput');
						}

						await command.executeChatInput(
							interaction,
							transformInteraction(interaction.options.data),
							effectiveLocale,
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
