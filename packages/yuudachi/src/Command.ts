import { basename, extname } from "node:path";
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import type { ArgumentsOf, CommandPayload } from "./interactions/ArgumentsOf.js";
import { logger } from "./logger.js";

export type ChatInput<T extends CommandPayload> = {
	chatInput(
		interaction: ChatInputCommandInteraction<"cached">,
		args: ArgumentsOf<T>,
		locale: string,
	): Promise<void> | void;
};

export type Autocomplete<T extends CommandPayload> = {
	autocomplete(
		interaction: AutocompleteInteraction<"cached">,
		args_: ArgumentsOf<T>,
		locale: string,
	): Promise<void> | void;
};

export type MessageContext<T extends CommandPayload> = {
	messageContext(
		interaction: MessageContextMenuCommandInteraction<"cached">,
		args: ArgumentsOf<T>,
		locale: string,
	): Promise<void> | void;
};

export type UserContext<T extends CommandPayload> = {
	userContext(
		interaction: UserContextMenuCommandInteraction<"cached">,
		args: ArgumentsOf<T>,
		locale: string,
	): Promise<void> | void;
};

export type Commands<T extends CommandPayload> = Autocomplete<T> &
	ChatInput<T> &
	MessageContext<T> &
	UserContext<T> & {
		[key: string]: any;
	};

export const enum CommandMethod {
	Autocomplete = "autocomplete",
	ChatInput = "chatInput",
	MessageContext = "messageContext",
	UserContext = "userContext",
}

type CommandMethodParameters<
	C extends CommandPayload = CommandPayload,
	T extends string = CommandMethod.ChatInput,
> = Parameters<Commands<C>[T]>;

export type InteractionParam<T extends CommandMethod = CommandMethod.ChatInput> = CommandMethodParameters<
	CommandPayload,
	T
>[0];
export type ArgsParam<
	C extends CommandPayload,
	T extends CommandMethod = CommandMethod.ChatInput,
> = CommandMethodParameters<C, T>[1];
export type LocaleParam<T extends CommandMethod = CommandMethod.ChatInput> = CommandMethodParameters<
	CommandPayload,
	T
>[2];

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

export type CommandInfo = {
	name: string;
};

export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== ".js") {
		return null;
	}

	return { name: basename(path, ".js") } as const;
}
