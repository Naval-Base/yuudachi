import type { Command } from "../Command.js";
import type { CommandPayload } from "../types/ArgumentsOf.js";
import { container } from "./container.js";
import { kCommands } from "./tokens.js";

export function createCommands<C extends Command = Command<CommandPayload>>() {
	const commands = new Map<string, C>();
	container.bind({ provide: kCommands, useValue: commands });
}
