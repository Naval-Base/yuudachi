import type { CommandInteractionOption } from 'discord.js';

import type { ArgumentsOf, Command } from './ArgumentsOf';

export function transformInteraction<T extends Command>(options: readonly CommandInteractionOption[]): ArgumentsOf<T> {
	const opts: any = {};

	for (const top of options) {
		if (top.type === 'SUB_COMMAND' || top.type === 'SUB_COMMAND_GROUP') {
			opts[top.name] = transformInteraction(top.options ? [...top.options] : []);
		} else if (top.type === 'USER') {
			opts[top.name] = { user: top.user, member: top.member };
		} else if (top.type === 'CHANNEL') {
			opts[top.name] = top.channel;
		} else if (top.type === 'ROLE') {
			opts[top.name] = top.role;
		} else {
			opts[top.name] = top.value;
		}
	}

	return opts;
}
