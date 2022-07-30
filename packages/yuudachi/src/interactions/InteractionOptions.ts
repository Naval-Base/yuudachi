import {
	type CommandInteractionOption,
	ApplicationCommandOptionType,
	GuildBasedChannel,
	Role,
	User,
	GuildMember,
	Attachment,
} from 'discord.js';
import type { ArgumentsOf, Command } from './ArgumentsOf.js';

export function transformInteraction<T extends Command>(
	options: readonly CommandInteractionOption<'cached'>[],
): ArgumentsOf<T> {
	const opts: Record<
		string,
		| ArgumentsOf<T>
		| { user?: User; member?: GuildMember }
		| GuildBasedChannel
		| Role
		| string
		| number
		| boolean
		| Attachment
		| undefined
	> = {};

	for (const top of options) {
		switch (top.type) {
			case ApplicationCommandOptionType.Subcommand:
			case ApplicationCommandOptionType.SubcommandGroup:
				opts[top.name] = transformInteraction<T>(top.options ? [...top.options] : []);
				break;
			case ApplicationCommandOptionType.User:
				opts[top.name] = { user: top.user, member: top.member };
				break;
			case ApplicationCommandOptionType.Channel:
				opts[top.name] = top.channel;
				break;
			case ApplicationCommandOptionType.Role:
				opts[top.name] = top.role;
				break;
			case ApplicationCommandOptionType.Mentionable:
				opts[top.name] = top.user ? { user: top.user, member: top.member } : top.role;
				break;
			case ApplicationCommandOptionType.Number:
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.String:
			case ApplicationCommandOptionType.Boolean:
				opts[top.name] = top.value;
				break;
			case ApplicationCommandOptionType.Attachment:
				opts[top.name] = top.attachment;
				break;
			default:
				break;
		}
	}

	return opts as ArgumentsOf<T>;
}
