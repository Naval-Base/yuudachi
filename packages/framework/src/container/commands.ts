import { container } from "tsyringe";
import type { Command } from "../Command.js";
import type { CommandPayload } from "../types/ArgumentsOf.js";
import { kCommands } from "./tokens.js";

export function createCommands<C extends Command = Command<CommandPayload>>() {
	const commands = new Map<string, C>();
	container.register(kCommands, { useValue: commands });
}
