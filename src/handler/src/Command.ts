import { APIInteraction, APIMessage, APIApplicationCommandInteractionDataOption } from 'discord-api-types/v8';
import { Args } from 'lexure';
import { basename, extname } from 'path';
import { CommandModules } from './Constants';

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
		message: APIMessage | APIInteraction,
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
