import type {
	APIApplicationCommandInteractionData,
	/* APIApplicationCommandInteractionDataOption, */
} from 'discord-api-types/v8';

export function transformInteraction(
	options: /* APIApplicationCommandInteractionDataOption[] */ any[],
	resolved: APIApplicationCommandInteractionData['resolved'],
	opts: Record<string, any> = {},
): any {
	if (options.length === 0) return opts;

	const top = options.shift();
	if (!top) return opts;

	if (top.type === 1 || top.type === 2) {
		opts[top.name] = transformInteraction(top.options ?? [], resolved);
	} else if (top.type === 6) {
		const user = resolved?.users?.[top.value];
		const member = {
			...resolved?.members?.[top.value],
			user,
		};
		opts[top.name] = member;
	} else if (top.type === 7) {
		opts[top.name] = resolved?.channels?.[top.value];
	} else if (top.type === 8) {
		opts[top.name] = resolved?.roles?.[top.value];
	} else {
		opts[top.name] = top.value;
	}

	return transformInteraction(options, resolved, opts);
}
