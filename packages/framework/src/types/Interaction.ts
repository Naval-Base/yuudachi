import type {
	APIApplicationCommandAutocompleteInteraction,
	APIChatInputApplicationCommandInteraction,
	APIMessageComponentButtonInteraction,
	APIMessageComponentSelectMenuInteraction,
	APIModalSubmitInteraction,
	APIUserApplicationCommandInteraction,
	APIMessageApplicationCommandInteraction,
} from "discord-api-types/v10";
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

export type ChatInput<C extends CommandPayload, R extends Runtime = Runtime.Discordjs> = {
	chatInput(
		interaction: R extends Runtime.Discordjs
			? ChatInputCommandInteraction<"cached">
			: APIChatInputApplicationCommandInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
};

export type Autocomplete<C extends CommandPayload, R extends Runtime = Runtime.Discordjs> = {
	autocomplete(
		interaction: R extends Runtime.Discordjs
			? AutocompleteInteraction<"cached">
			: APIApplicationCommandAutocompleteInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
};

export type MessageContext<C extends CommandPayload, R extends Runtime = Runtime.Discordjs> = {
	messageContext(
		interaction: R extends Runtime.Discordjs
			? MessageContextMenuCommandInteraction<"cached">
			: APIMessageApplicationCommandInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
};

export type UserContext<C extends CommandPayload, R extends Runtime = Runtime.Discordjs> = {
	userContext(
		interaction: R extends Runtime.Discordjs
			? UserContextMenuCommandInteraction<"cached">
			: APIUserApplicationCommandInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
};

export type Button<C extends ComponentPayload, R extends Runtime = Runtime.Discordjs> = {
	button(
		interaction: R extends Runtime.Discordjs ? ButtonInteraction<"cached"> : APIMessageComponentButtonInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
};

export type SelectMenu<C extends ComponentPayload, R extends Runtime = Runtime.Discordjs> = {
	selectMenu(
		interaction: R extends Runtime.Discordjs
			? AnySelectMenuInteraction<"cached">
			: APIMessageComponentSelectMenuInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
};

export type ModalSubmit<C extends ComponentPayload, R extends Runtime = Runtime.Discordjs> = {
	modalSubmit(
		interaction: R extends Runtime.Discordjs ? ModalSubmitInteraction<"cached"> : APIModalSubmitInteraction,
		args: ArgumentsOf<C, R>,
		locale: string,
	): Promise<any> | any;
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
