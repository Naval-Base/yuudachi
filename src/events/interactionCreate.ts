import { Client, Constants, Interaction } from 'discord.js';
import { on } from 'node:events';
import { inject, injectable } from 'tsyringe';
import type { Command } from '../Command';

import type { Event } from '../Event';
import { transformInteraction } from '../interactions/InteractionOptions';
import { logger } from '../logger';
import { kCommands } from '../tokens';

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Constants.Events.INTERACTION_CREATE;

	public constructor(
		public readonly client: Client,
		@inject(kCommands) public readonly commands: Map<string, Command>,
	) {}

	public async execute(): Promise<void> {
		for await (const [interaction] of on(this.client, this.event) as AsyncIterableIterator<[Interaction]>) {
			if (!interaction.isCommand()) {
				continue;
			}

			const command = this.commands.get(interaction.commandName);
			if (command) {
				try {
					const args = [...interaction.options.values()];
					await command.execute(interaction, transformInteraction(args), 'en');
				} catch (error) {
					logger.error(error);
					await interaction.editReply({ content: error.message, components: [] });
				}
			}

			continue;
		}
	}
}
