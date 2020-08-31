import { Message } from '@spectacles/types';
import { Args } from 'lexure';
import { basename, parse, sep, extname } from 'path';

export default interface Command {
	name?: string;
	aliases?: string[];
	category?: string;
	description?: string;
	clientPermissions?: string[];
	userPermissions?: string[];
	execute(message: Message, args: Args, locale: string): unknown | Promise<unknown>;
}

export interface CommandInfo {
	name: string;
	category: string;
}

export function commandInfo(path: string): CommandInfo | null {
	if (extname(path) !== '.js') {
		return null;
	}

	let category = parse(path).dir.split(sep).pop();
	if (!category) category = 'none';

	return {
		name: basename(path, '.js'),
		category,
	};
}
