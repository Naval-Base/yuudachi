import { basename, extname } from 'node:path';
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from 'discord.js';
import type { ArgumentsOf, CommandPayload } from './interactions/ArgumentsOf.js';
import { logger } from './logger.js';

export interface ChatInput<T extends CommandPayload> {
	chatInput: (
		interaction: ChatInputCommandInteraction<'cached'>,
		args: ArgumentsOf<T>,
		locale: string,
	) => void | Promise<void>;
}

export interface Autocomplete<T extends CommandPayload> {
	autocomplete: (
		interaction: AutocompleteInteraction<'cached'>,
		args_: ArgumentsOf<T>,
		locale: string,
	) => void | Promise<void>;
}

export interface MessageContext<T extends CommandPayload> {
	messageContext: (
		interaction: MessageContextMenuCommandInteraction<'cached'>,
		args: ArgumentsOf<T>,
		locale: string,
	) => void | Promise<void>;
}

export interface UserContext<T extends CommandPayload> {
	userContext: (
		interaction: UserContextMenuCommandInteraction<'cached'>,
		args: ArgumentsOf<T>,
		locale: string,
	) => void | Promise<void>;
}

export interface Commands<T extends CommandPayload>
	extends ChatInput<T>,
		Autocomplete<T>,
		MessageContext<T>,
		UserContext<T> {
	[key: string]: any;
}

export const enum CommandMethod {
	ChatInput = 'chatInput',
	Autocomplete = 'autocomplete',
	MessageContext = 'messageContext',
	UserContext = 'userContext',
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
	public constructor(public readonly name?: T['name'][]) {}

	public chatInput(interaction: InteractionParam, _: ArgsParam<T>, __: LocaleParam): void | Promise<void> {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received chat input for ${interaction.commandName}, but the command does not handle chat input`,
		);
	}

	public autocomplete(
		interaction: InteractionParam<CommandMethod.Autocomplete>,
		_args: ArgsParam<T>,
		_locale: LocaleParam,
	): void | Promise<void> {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received autocomplete for ${interaction.commandName}, but the command does not handle autocomplete`,
		);
	}

	public messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		_args: ArgsParam<T>,
		_locale: LocaleParam,
	): void | Promise<void> {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received message context for ${interaction.commandName}, but the command does not handle message context`,
		);
	}

	public userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		_args: ArgsParam<T>,
		_locale: LocaleParam,
	): void | Promise<void> {
		logger.info(
			{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
			`Received user context for ${interaction.commandName}, but the command does not handle user context`,
		);
	}
}

export interface CommandInfo {
	name: string;
}

export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== '.js') {
		return null;
	}

	return { name: basename(path, '.js') } as const;
}
