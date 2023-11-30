import { container } from "tsyringe";
import type { Command } from "../Command.js";
import type { CommandPayload } from "../types/ArgumentsOf.js";
import { kCommands } from "./tokens.js";

export type CommandMap = Map<string, Command<CommandPayload>>;

export function createCommands<C = CommandMap>() {
	const commands = new Map<string, C>();
	container.register(kCommands, { useValue: commands });
}
