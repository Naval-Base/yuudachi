import type {
	AnySelectMenuInteraction,
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import type { ArgumentsOf, CommandPayload, ComponentPayload, Runtime } from "./ArgumentsOf.js";

export type ChatInput<C extends CommandPayload, R extends Runtime> = {
	chatInput(
		interaction: ChatInputCommandInteraction<"cached">,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<void> | void;
};

export type Autocomplete<C extends CommandPayload, R extends Runtime> = {
	autocomplete(
		interaction: AutocompleteInteraction<"cached">,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<void> | void;
};

export type MessageContext<C extends CommandPayload, R extends Runtime> = {
	messageContext(
		interaction: MessageContextMenuCommandInteraction<"cached">,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<void> | void;
};

export type UserContext<C extends CommandPayload, R extends Runtime> = {
	userContext(
		interaction: UserContextMenuCommandInteraction<"cached">,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<void> | void;
};

export type Button<C extends ComponentPayload, R extends Runtime> = {
	button(interaction: ButtonInteraction<"cached">, args: ArgumentsOf<C, R>, locale: string): Promise<void> | void;
};

export type SelectMenu<C extends ComponentPayload, R extends Runtime> = {
	selectMenu(
		interaction: AnySelectMenuInteraction<"cached">,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<void> | void;
};

export type ModalSubmit<C extends ComponentPayload, R extends Runtime> = {
	modalSubmit(
		interaction: ModalSubmitInteraction<"cached">,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<void> | void;
};

export type Commands<C extends CommandPayload, R extends Runtime = Runtime.Discordjs> = Autocomplete<C, R> &
	ChatInput<C, R> &
	MessageContext<C, R> &
	UserContext<C, R> & {
		[key: string]: any;
	};

export type Components<C extends ComponentPayload, R extends Runtime = Runtime.Discordjs> = Button<C, R> &
	ModalSubmit<C, R> &
	SelectMenu<C, R> & {
		[key: string]: any;
	};

export const enum InteractionType {
	ApplicationCommand,
	Component,
}

export const enum CommandMethod {
	Autocomplete = "autocomplete",
	ChatInput = "chatInput",
	MessageContext = "messageContext",
	UserContext = "userContext",
}

export const enum ComponentMethod {
	Button = "button",
	ModalSubmit = "modalSubmit",
	SelectMenu = "selectMenu",
}

type CommandMethodParameters<
	C extends CommandPayload = CommandPayload,
	T extends string = CommandMethod.ChatInput,
	R extends Runtime = Runtime.Discordjs,
> = Parameters<Commands<C, R>[T]>;

type ComponentMethodParameters<
	C extends ComponentPayload = ComponentPayload,
	T extends string = ComponentMethod.Button,
	R extends Runtime = Runtime.Discordjs,
> = Parameters<Components<C, R>[T]>;

export type InteractionParam<
	C extends CommandMethod | ComponentMethod = CommandMethod.ChatInput,
	T extends InteractionType = InteractionType.ApplicationCommand,
	R extends Runtime = Runtime.Discordjs,
> = T extends InteractionType.Component
	? ComponentMethodParameters<ComponentPayload, C, R>[0]
	: CommandMethodParameters<CommandPayload, C, R>[0];
export type ArgsParam<
	C extends CommandPayload | ComponentPayload,
	M extends CommandMethod | ComponentMethod = CommandMethod.ChatInput,
	T extends InteractionType = InteractionType.ApplicationCommand,
	R extends Runtime = Runtime.Discordjs,
> = T extends InteractionType.Component
	? C extends ComponentPayload
		? ComponentMethodParameters<C, M, R>[1]
		: never
	: C extends CommandPayload
	? CommandMethodParameters<C, M, R>[1]
	: never;
export type LocaleParam<
	C extends CommandMethod | ComponentMethod = CommandMethod.ChatInput,
	T extends InteractionType = InteractionType.ApplicationCommand,
	R extends Runtime = Runtime.Discordjs,
> = T extends InteractionType.Component
	? ComponentMethodParameters<ComponentPayload, C, R>[2]
	: CommandMethodParameters<CommandPayload, C, R>[2];
