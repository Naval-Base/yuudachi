import type { Guild } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import { resolveMemberAndUser } from "../src/util/resolveMemberAndUser.js";

const user = { id: "123" } as const;

describe("resolveMemberAndUser", () => {
	it("returns member when fetch succeeds", async () => {
		const member = { user };
		const guild = {
			members: {
				fetch: vi.fn().mockResolvedValue(member),
			},
		} as unknown as Guild;

		await expect(resolveMemberAndUser(guild, "123")).resolves.toEqual({ member, user });
	});

	it("falls back to user fetch on failure", async () => {
		const guild = {
			members: {
				fetch: vi.fn().mockRejectedValue(new Error("no member")),
			},
			client: {
				users: {
					fetch: vi.fn().mockResolvedValue(user),
				},
			},
		} as unknown as Guild;

		await expect(resolveMemberAndUser(guild, "123")).resolves.toEqual({ user });
	});

	it("throws when both member and user fetch fail", async () => {
		const guild = {
			members: {
				fetch: vi.fn().mockRejectedValue(new Error("no member")),
			},
			client: {
				users: {
					fetch: vi.fn().mockRejectedValue(new Error("no user")),
				},
			},
		} as unknown as Guild;

		await expect(resolveMemberAndUser(guild, "123")).rejects.toThrow("no user");
	});
});
