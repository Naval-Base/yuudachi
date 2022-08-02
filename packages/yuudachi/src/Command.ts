import { basename, extname } from 'node:path';
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	UserContextMenuCommandInteraction,
	MessageContextMenuCommandInteraction,
	User,
	GuildMember,
	Message,
} from 'discord.js';

interface UserContextArgs {
	user: User;
	member?: GuildMember;
}

interface MessageContextArgs {
	message: Message;
}

export type StaticContextArgs<T extends 'user' | 'message'> = T extends 'user' ? UserContextArgs : MessageContextArgs;

export interface Command {
	name?: string;
	userContextName?: string;
	messageContextName?: string;
	autocomplete?: (
		interaction: AutocompleteInteraction<'cached'>,
		args: any,
		locale: string,
	) => unknown | Promise<unknown>;
	executeChatInput?: (
		interaction: ChatInputCommandInteraction<'cached'>,
		args: any,
		locale: string,
	) => unknown | Promise<unknown>;
	executeUserContext?: (
		interaction: UserContextMenuCommandInteraction<'cached'>,
		args: any,
		locale: string,
	) => unknown | Promise<unknown>;
	executeMessageContext?: (
		interaction: MessageContextMenuCommandInteraction<'cached'>,
		args: MessageContextArgs,
		locale: string,
	) => unknown | Promise<unknown>;
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
