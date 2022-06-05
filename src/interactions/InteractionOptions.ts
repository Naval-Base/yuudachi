import { type CommandInteractionOption, ApplicationCommandOptionType } from 'discord.js';
import type { ArgumentsOf, Command } from './ArgumentsOf.js';

export function transformInteraction<T extends Command>(options: readonly CommandInteractionOption[]): ArgumentsOf<T> {
	const opts: any = {};

	for (const top of options) {
		switch (top.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				opts[top.name] = transformInteraction(top.options ? [...top.options] : []);
				break;
			case ApplicationCommandOptionType.User:
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				opts[top.name] = { user: top.user, member: top.member };
				break;
			case ApplicationCommandOptionType.Channel:
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				opts[top.name] = top.channel;
				break;
			case ApplicationCommandOptionType.Role:
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				opts[top.name] = top.role;
				break;
			case ApplicationCommandOptionType.Mentionable:
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				opts[top.name] = top.user ? { user: top.user, member: top.member } : top.role;
				break;
			case ApplicationCommandOptionType.Number:
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.String:
			case ApplicationCommandOptionType.Boolean:
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				opts[top.name] = top.value;
				break;
			default:
				break;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return opts;
}
