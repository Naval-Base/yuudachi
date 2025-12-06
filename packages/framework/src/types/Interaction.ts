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
	CacheType,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js";
import type { ArgumentsOf, CommandPayload, ComponentPayload, Runtime } from "./ArgumentsOf.js";

export type ChatInput<
	C extends CommandPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	chatInput(
		interaction: R extends Runtime.Discordjs
			? ChatInputCommandInteraction<T>
			: APIChatInputApplicationCommandInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type Autocomplete<
	C extends CommandPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	autocomplete(
		interaction: R extends Runtime.Discordjs
			? AutocompleteInteraction<T>
			: APIApplicationCommandAutocompleteInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type MessageContext<
	C extends CommandPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	messageContext(
		interaction: R extends Runtime.Discordjs
			? MessageContextMenuCommandInteraction<T>
			: APIMessageApplicationCommandInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type UserContext<
	C extends CommandPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	userContext(
		interaction: R extends Runtime.Discordjs
			? UserContextMenuCommandInteraction<T>
			: APIUserApplicationCommandInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type Button<
	C extends ComponentPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	button(
		interaction: R extends Runtime.Discordjs ? ButtonInteraction<T> : APIMessageComponentButtonInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type SelectMenu<
	C extends ComponentPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	selectMenu(
		interaction: R extends Runtime.Discordjs ? AnySelectMenuInteraction<T> : APIMessageComponentSelectMenuInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type ModalSubmit<
	C extends ComponentPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = {
	modalSubmit(
		interaction: R extends Runtime.Discordjs ? ModalSubmitInteraction<T> : APIModalSubmitInteraction,
		args: ArgumentsOf<C, R, T>,
		locale: string,
	): Promise<any> | any;
};

export type Commands<
	C extends CommandPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = Autocomplete<C, R, T> &
	ChatInput<C, R, T> &
	MessageContext<C, R, T> &
	UserContext<C, R, T> & {
		[key: string]: any;
	};

export type Components<
	C extends ComponentPayload,
	R extends Runtime = Runtime.Discordjs,
	T extends CacheType = "cached",
> = Button<C, R, T> &
	ModalSubmit<C, R, T> &
	SelectMenu<C, R, T> & {
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
	Z extends CacheType = "cached",
> = Parameters<Commands<C, R, Z>[T]>;

type ComponentMethodParameters<
	C extends ComponentPayload = ComponentPayload,
	T extends string = ComponentMethod.Button,
	R extends Runtime = Runtime.Discordjs,
	Z extends CacheType = "cached",
> = Parameters<Components<C, R, Z>[T]>;

export type InteractionParam<
	C extends CommandMethod | ComponentMethod = CommandMethod.ChatInput,
	T extends InteractionType = InteractionType.ApplicationCommand,
	R extends Runtime = Runtime.Discordjs,
	Z extends CacheType = "cached",
> = T extends InteractionType.Component
	? ComponentMethodParameters<ComponentPayload, C, R, Z>[0]
	: CommandMethodParameters<CommandPayload, C, R, Z>[0];
export type ArgsParam<
	C extends CommandPayload | ComponentPayload,
	M extends CommandMethod | ComponentMethod = CommandMethod.ChatInput,
	T extends InteractionType = InteractionType.ApplicationCommand,
	R extends Runtime = Runtime.Discordjs,
	Z extends CacheType = "cached",
> = T extends InteractionType.Component
	? C extends ComponentPayload
		? ComponentMethodParameters<C, M, R, Z>[1]
		: never
	: C extends CommandPayload
		? CommandMethodParameters<C, M, R, Z>[1]
		: never;
export type LocaleParam<
	C extends CommandMethod | ComponentMethod = CommandMethod.ChatInput,
	T extends InteractionType = InteractionType.ApplicationCommand,
	R extends Runtime = Runtime.Discordjs,
	Z extends CacheType = "cached",
> = T extends InteractionType.Component
	? ComponentMethodParameters<ComponentPayload, C, R, Z>[2]
	: CommandMethodParameters<CommandPayload, C, R, Z>[2];
