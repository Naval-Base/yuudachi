import { basename, extname } from 'node:path';
import type { CommandInteraction } from 'discord.js';

export interface Command {
	name?: string;
	execute: (interaction: CommandInteraction<'cached'>, args: unknown, locale: string) => unknown | Promise<unknown>;
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
