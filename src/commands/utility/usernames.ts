import type { CommandInteraction } from 'discord.js';
import type { Redis } from 'ioredis';
import { injectable, inject } from 'tsyringe';
import { add } from './sub/username/add.js';
import { remove } from './sub/username/remove.js';
import type { Command } from '../../Command.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { UsernamesCommand } from '../../interactions/index.js';
import { kRedis } from '../../tokens.js';

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof UsernamesCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		switch (Object.keys(args)[0]) {
			case 'add': {
				return add(interaction, args.add, this.redis, locale);
			}
			case 'remove': {
				return remove(interaction, args.remove.query, this.redis, locale);
			}

			default:
				break;
		}
	}
}
