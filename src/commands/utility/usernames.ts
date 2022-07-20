import type { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import type { Redis } from 'ioredis';
import { injectable, inject } from 'tsyringe';
import { add } from './sub/username/add.js';
import { remove } from './sub/username/remove.js';
import type { Command } from '../../Command.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { UsernamesCommand } from '../../interactions/index.js';
import { kRedis } from '../../tokens.js';
import { getAllFlaggedUsernames, RawFlaggedUsernameData } from '../../util/flaggedUsernames.js';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async autocomplete(
		interaction: AutocompleteInteraction<'cached'>,
		args: ArgumentsOf<typeof UsernamesCommand>,
	): Promise<void> {
		const flaggedUsernames = await getAllFlaggedUsernames(this.redis);

		if (!flaggedUsernames.length) {
			await interaction.respond([]);
		}

		const query = args.remove.query.toLowerCase();

		const matches = flaggedUsernames.filter((entry) => entry.name.toLowerCase().startsWith(query));

		if (!matches.length || !query.length) {
			await interaction.respond(
				flaggedUsernames
					.map((entry) => ({
						name: `${entry.name} (${entry.regex.toString()})`,
						value: entry.name,
					}))
					.slice(0, 25),
			);
		}

		await interaction.respond(
			matches.map((entry) => ({
				name: `${entry.name} (${entry.regex.toString()})`,
				value: entry.name,
			})),
		);
	}

	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof UsernamesCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		switch (Object.keys(args)[0]) {
			case 'add': {
				return add(interaction, args.add as RawFlaggedUsernameData, this.redis, locale);
			}

			case 'remove': {
				return remove(interaction, args.remove.query, this.redis, locale);
			}

			default:
				break;
		}
	}
}
