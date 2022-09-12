import { container } from "tsyringe";
import type { Command } from "../Command.js";
import type { CommandPayload } from "../interactions/ArgumentsOf.js";
import { kCommands } from "../tokens.js";

export function createCommands() {
	const commands = new Map<string, Command<CommandPayload>>();
	container.register(kCommands, { useValue: commands });
}
