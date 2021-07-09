import type { CommandInteractionOption } from 'discord.js';

import type { ArgumentsOf, Command } from './ArgumentsOf.js';

export function transformInteraction<T extends Command>(
	options: CommandInteractionOption[],
	opts: any = {},
): ArgumentsOf<T> {
	if (options.length === 0) return opts;

	const top = options.shift();
	if (!top) return opts;

	if (top.type === 'SUB_COMMAND' || top.type === 'SUB_COMMAND_GROUP') {
		opts[top.name] = transformInteraction(top.options ? [...top.options.values()] : []);
	} else if (top.type === 'USER') {
		opts[top.name] = { user: top.user, member: top.member };
	} else if (top.type === 'CHANNEL') {
		opts[top.name] = top.channel;
	} else if (top.type === 'ROLE') {
		opts[top.name] = top.role;
	} else {
		opts[top.name] = top.value;
	}

	return transformInteraction(options, opts);
}
