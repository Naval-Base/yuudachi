import { inject, injectable } from "@needle-di/core";
import type { Command } from "@yuudachi/framework";
import { transformApplicationInteraction, logger, kCommands } from "@yuudachi/framework";
import type { Event } from "@yuudachi/framework/types";
import { Client, ApplicationCommandType, Events, MessageFlags } from "discord.js";
import { Counter } from "prom-client";
import { handleCaseAutocomplete } from "../functions/autocomplete/cases.js";
import { handleReasonAutocomplete } from "../functions/autocomplete/reasons.js";
import { handleReportAutocomplete } from "../functions/autocomplete/reports.js";
import { AutocompleteType, findAutocompleteType } from "../functions/autocomplete/validate.js";
import { getGuildSetting, SettingsKeys } from "../functions/settings/getGuildSetting.js";

const commandCounter = new Counter({
	name: "yuudachi_bot_v3_gateway_events_interaction_create_command_total",
	help: "Total interaction create command gateway events",
	labelNames: ["commandType", "type", "commandName"],
});

const commandSuccessCounter = new Counter({
	name: "yuudachi_bot_v3_gateway_events_interaction_create_command_success_total",
	help: "Total succeeded interaction create command gateway events",
	labelNames: ["commandType", "type", "commandName"],
});

const commandFailureCounter = new Counter({
	name: "yuudachi_bot_v3_gateway_events_interaction_create_command_failure_total",
	help: "Total failed interaction create command gateway events",
	labelNames: ["commandType", "type", "commandName"],
});

@injectable()
export default class implements Event {
	public name = "Interaction handling";

	public event = Events.InteractionCreate as const;

	public constructor(
		public readonly client: Client<true> = inject(Client),
		public readonly commands: Map<string, Command> = inject(kCommands),
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (
				!interaction.isCommand() &&
				!interaction.isUserContextMenuCommand() &&
				!interaction.isMessageContextMenuCommand() &&
				!interaction.isAutocomplete()
			) {
				return;
			}

			if (!interaction.inCachedGuild()) {
				return;
			}

			const command = this.commands.get(interaction.commandName.toLowerCase());

			if (command) {
				commandCounter.inc({
					commandType: interaction.commandType,
					type: interaction.type,
					commandName: interaction.commandName,
				});

				try {
					const locale = await getGuildSetting(interaction.guildId, SettingsKeys.Locale);
					const forceLocale = await getGuildSetting<boolean>(interaction.guildId, SettingsKeys.ForceLocale);

					const effectiveLocale = forceLocale ? locale : interaction.locale;

					// oxlint-disable-next-line switch-exhaustiveness-check
					switch (interaction.commandType) {
						case ApplicationCommandType.ChatInput: {
							const isAutocomplete = interaction.isAutocomplete();

							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Executing ${isAutocomplete ? "autocomplete" : "chatInput command"} ${interaction.commandName}`,
							);

							if (isAutocomplete) {
								const autocompleteType = findAutocompleteType(interaction.options.getFocused(true).name);

								logger.info(
									{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
									`Executing autocomplete ${interaction.commandName} with type ${autocompleteType ?? "custom"}`,
								);

								if (autocompleteType === AutocompleteType.Reason) {
									await handleReasonAutocomplete(interaction, effectiveLocale);
									break;
								}

								if (autocompleteType === AutocompleteType.Case) {
									await handleCaseAutocomplete(interaction, effectiveLocale);
									break;
								}

								if (autocompleteType === AutocompleteType.Report) {
									await handleReportAutocomplete(interaction, effectiveLocale);
									break;
								}

								await command.autocomplete(
									interaction,
									transformApplicationInteraction(interaction.options.data),
									effectiveLocale,
								);
								break;
							} else {
								await command.chatInput(
									interaction,
									transformApplicationInteraction(interaction.options.data),
									effectiveLocale,
								);
								break;
							}
						}

						case ApplicationCommandType.Message: {
							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Executing message context command ${interaction.commandName}`,
							);

							await command.messageContext(
								interaction,
								transformApplicationInteraction(interaction.options.data),
								effectiveLocale,
							);
							break;
						}

						case ApplicationCommandType.User: {
							logger.info(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								`Executing user context command ${interaction.commandName}`,
							);

							await command.userContext(
								interaction,
								transformApplicationInteraction(interaction.options.data),
								effectiveLocale,
							);
							break;
						}

						default:
							break;
					}

					commandSuccessCounter.inc({
						commandType: interaction.commandType,
						type: interaction.type,
						commandName: interaction.commandName,
					});
				} catch (error) {
					const error_ = error as Error;
					logger.error(error_, error_.message);

					commandFailureCounter.inc({
						commandType: interaction.commandType,
						type: interaction.type,
						commandName: interaction.commandName,
					});

					try {
						if (interaction.isAutocomplete()) {
							return;
						}

						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								"Command interaction has not been deferred before throwing",
							);
							await interaction.deferReply({ flags: MessageFlags.Ephemeral });
						}

						await interaction.editReply({ content: error_.message, components: [] });
					} catch (error) {
						const subError = error as Error;
						logger.error(subError, subError.message);
					}
				}
			}
		});
	}
}
