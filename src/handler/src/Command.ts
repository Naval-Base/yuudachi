import type { APIGuildInteraction } from 'discord-api-types/v8';
import { basename, extname } from 'path';
import type { CommandModules } from '@yuudachi/types';

export default interface Command {
	name?: string;
	category: CommandModules;
	description?: string;
	clientPermissions?: string[];
	userPermissions?: string[];
	regExp?: RegExp;
	execute(message: APIGuildInteraction, args: unknown, locale: string): unknown | Promise<unknown>;
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
