import { container } from 'tsyringe';
import type { Command } from '../Command.js';
import { kCommands } from '../tokens.js';

export function createCommands(): Map<string, Command> {
	const commands = new Map<string, Command>();
	container.register(kCommands, { useValue: commands });

	return commands;
}
