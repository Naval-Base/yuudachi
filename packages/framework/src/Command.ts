import { basename, extname } from "node:path";
import { logger } from "./logger.js";
import type { CommandPayload } from "./types/ArgumentsOf.js";
import type { CommandInfo } from "./types/Command.js";
import type { ArgsParam, CommandMethod, Commands, InteractionParam, LocaleParam } from "./types/Interaction.js";

export abstract class Command<T extends CommandPayload> implements Commands<T> {
	public constructor(public readonly name?: T["name"][]) {}

	public chatInput(interaction: InteractionParam, _: ArgsParam<T>, __: LocaleParam): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received chat input for ${interaction.commandName}, but the command does not handle chat input`,
		);
	}

	public autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		_args: ArgsParam<T>,
		_locale: LocaleParam,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received autocomplete for ${interaction.commandName}, but the command does not handle autocomplete`,
		);
	}

	public messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		_args: ArgsParam<T>,
		_locale: LocaleParam,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received message context for ${interaction.commandName}, but the command does not handle message context`,
		);
	}

	public userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		_args: ArgsParam<T>,
		_locale: LocaleParam,
	): Promise<void> | void {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received user context for ${interaction.commandName}, but the command does not handle user context`,
		);
	}
}

export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== ".js") {
		return null;
	}

	return { name: basename(path, ".js") } as const;
}
