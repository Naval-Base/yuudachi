import type { Guild } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import { chatInputApplicationCommandMention, resolveGuildCommand } from "../src/util/commandUtils.js";

describe("resolveGuildCommand", () => {
	it("returns cached command when present", async () => {
		const command = { name: "ping" };
		const guild = {
			commands: {
				cache: {
					size: 1,
					find: vi.fn((fn) => fn(command) && command),
				},
			},
			name: "guild",
		} as unknown as Guild;

		await expect(resolveGuildCommand(guild, "ping")).resolves.toBe(command);
	});

	it("fetches commands when cache is empty", async () => {
		const command = { name: "ping" };
		const guild = {
			commands: {
				cache: {
					size: 0,
				},
				fetch: vi.fn().mockResolvedValue({
					find: (fn: any) => (fn(command) ? command : null),
				}),
			},
			name: "guild",
		} as unknown as Guild;

		await expect(resolveGuildCommand(guild, "ping")).resolves.toBe(command);
	});

	it("returns null when command is missing", async () => {
		const guild = {
			commands: {
				cache: {
					size: 1,
					find: vi.fn(() => undefined),
				},
			},
		} as unknown as Guild;

		await expect(resolveGuildCommand(guild, "missing")).resolves.toBeNull();
	});
});

describe("chatInputApplicationCommandMention", () => {
	it("formats command mentions", () => {
		expect(chatInputApplicationCommandMention("ping", "123")).toBe("</ping:123>");
	});
});
