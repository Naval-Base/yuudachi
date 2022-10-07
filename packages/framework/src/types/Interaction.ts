import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import type { ArgumentsOf, CommandPayload } from "./ArgumentsOf.js";

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
