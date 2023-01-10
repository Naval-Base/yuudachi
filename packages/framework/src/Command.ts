import { basename, extname } from "node:path";
import { logger } from "./logger.js";
import type { CommandPayload, Runtime } from "./types/ArgumentsOf.js";
import type { CommandInfo } from "./types/Command.js";
import type {
	ArgsParam,
	CommandMethod,
	Commands,
	InteractionParam,
	InteractionType,
	LocaleParam,
} from "./types/Interaction.js";

export abstract class Command<C extends CommandPayload = CommandPayload, R extends Runtime = Runtime.Discordjs>
	implements Commands<C, R>
{
	public constructor(public readonly name?: C["name"][]) {}

	public chatInput(
		_interaction: InteractionParam<CommandMethod.ChatInput, InteractionType.ApplicationCommand, R>,
		_args: ArgsParam<C, CommandMethod.ChatInput, InteractionType.ApplicationCommand, R>,
		_locale: LocaleParam<CommandMethod.ChatInput, InteractionType.ApplicationCommand, R>,
	): Promise<any> | any {
		const commandName = "commandName" in _interaction ? _interaction.commandName : _interaction.data.name;
		logger.info(
			{ command: { name: commandName, type: _interaction.type }, userId: _interaction.user?.id },
			`Received chat input for ${commandName}, but the command does not handle chat input`,
		);
	}

	public autocomplete(
		_interaction: InteractionParam<CommandMethod.Autocomplete, InteractionType.ApplicationCommand, R>,
		_args: ArgsParam<C, CommandMethod.Autocomplete, InteractionType.ApplicationCommand, R>,
		_locale: LocaleParam<CommandMethod.Autocomplete, InteractionType.ApplicationCommand, R>,
	): Promise<any> | any {
		const commandName = "commandName" in _interaction ? _interaction.commandName : _interaction.data.name;
		logger.info(
			{ command: { name: commandName, type: _interaction.type }, userId: _interaction.user?.id },
			`Received autocomplete for ${commandName}, but the command does not handle autocomplete`,
		);
	}

	public messageContext(
		_interaction: InteractionParam<CommandMethod.MessageContext, InteractionType.ApplicationCommand, R>,
		_args: ArgsParam<C, CommandMethod.MessageContext, InteractionType.ApplicationCommand, R>,
		_locale: LocaleParam<CommandMethod.MessageContext, InteractionType.ApplicationCommand, R>,
	): Promise<any> | any {
		const commandName = "commandName" in _interaction ? _interaction.commandName : _interaction.data.name;
		logger.info(
			{ command: { name: commandName, type: _interaction.type }, userId: _interaction.user?.id },
			`Received message context for ${commandName}, but the command does not handle message context`,
		);
	}

	public userContext(
		_interaction: InteractionParam<CommandMethod.UserContext, InteractionType.ApplicationCommand, R>,
		_args: ArgsParam<C, CommandMethod.UserContext, InteractionType.ApplicationCommand, R>,
		_locale: LocaleParam<CommandMethod.UserContext, InteractionType.ApplicationCommand, R>,
	): Promise<any> | any {
		const commandName = "commandName" in _interaction ? _interaction.commandName : _interaction.data.name;
		logger.info(
			{ command: { name: commandName, type: _interaction.type }, userId: _interaction.user?.id },
			`Received user context for ${commandName}, but the command does not handle user context`,
		);
	}
}

export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== ".js") {
		return null;
	}

	return { name: basename(path, ".js") } as const;
}
