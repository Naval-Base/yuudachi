import { basename, extname } from 'node:path';
import type { AutocompleteInteraction, CommandInteraction } from 'discord.js';

export interface Command {
	name?: string;
	execute: (interaction: CommandInteraction<'cached'>, args: any, locale: string) => unknown | Promise<unknown>;
	autocomplete?: (
		interaction: AutocompleteInteraction<'cached'>,
		args: any,
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

	return { name: basename(path, '.js') };
}
