import type { APIGuildInteraction, APIMessage, APIApplicationCommandInteractionDataOption } from 'discord-api-types/v8';
import type { Args } from 'lexure';
import { basename, extname } from 'path';
import type { CommandModules } from '@yuudachi/types';

export enum ExecutionContext {
	PREFIXED,
	INTERACTION,
	REGEXP,
}

export default interface Command {
	name?: string;
	aliases?: string[];
	category: CommandModules;
	description?: string;
	clientPermissions?: string[];
	userPermissions?: string[];
	regExp?: RegExp;
	execute(
		message: APIMessage | APIGuildInteraction,
		args: Args | APIApplicationCommandInteractionDataOption[],
		locale: string,
		executionContext: ExecutionContext,
	): unknown | Promise<unknown>;
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
