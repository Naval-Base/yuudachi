import type { CommandInteraction } from 'discord.js';
import { basename, extname } from 'node:path';

export interface Command {
	name?: string;
	execute(interaction: CommandInteraction, args: unknown, locale: string): unknown | Promise<unknown>;
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
