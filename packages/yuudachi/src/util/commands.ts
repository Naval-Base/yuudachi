import { Collection } from 'discord.js';
import { container } from 'tsyringe';
import type { Command } from '../Command.js';
import { kCommands } from '../tokens.js';

export function createCommands() {
	const commands = new Collection<string, Command>();
	container.register(kCommands, { useValue: commands });

	return commands;
}
