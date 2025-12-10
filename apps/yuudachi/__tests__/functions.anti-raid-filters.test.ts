import type { GuildMember } from "discord.js";
import { describe, expect, it } from "vitest";
import {
	ageFilter,
	avatarFilter,
	confusablesFilter,
	joinFilter,
	patternFilter,
	zalgoFilter,
} from "../src/functions/anti-raid/filters.js";

type MemberShape = {
	avatar?: string | null;
	joinedTimestamp?: number | null;
	user: {
		avatar?: string | null;
		createdTimestamp: number;
		username: string;
	};
};

const createMember = (overrides: Partial<MemberShape> = {}): GuildMember => {
	const member: MemberShape = {
		joinedTimestamp: 1_000,
		avatar: "member-avatar",
		user: {
			username: "example",
			avatar: "user-avatar",
			createdTimestamp: 500,
			...overrides.user,
		},
		...overrides,
	};

	return member as unknown as GuildMember;
};

describe("joinFilter", () => {
	it("allows members without a join timestamp", () => {
		expect(joinFilter(createMember({ joinedTimestamp: null }))).toBe(true);
	});

	it("filters based on inclusive bounds", () => {
		expect(joinFilter(createMember({ joinedTimestamp: 1_500 }), 1_000, 2_000)).toBe(true);
		expect(joinFilter(createMember({ joinedTimestamp: 500 }), 1_000, 2_000)).toBe(false);
		expect(joinFilter(createMember({ joinedTimestamp: 2_500 }), 1_000, 2_000)).toBe(false);
	});
});

describe("ageFilter", () => {
	it("checks user creation timestamps", () => {
		expect(ageFilter(createMember(), 100, 1_000)).toBe(true);
		expect(ageFilter(createMember({ user: { username: "user", createdTimestamp: 50 } }), 100, 1_000)).toBe(false);
		expect(ageFilter(createMember({ user: { username: "user", createdTimestamp: 1_500 } }), 100, 1_000)).toBe(false);
	});
});

describe("patternFilter", () => {
	it("passes when no pattern provided", () => {
		expect(patternFilter(createMember(), undefined)).toBe(true);
	});

	it("matches against usernames and confusables", () => {
		const member = createMember({ user: { username: "ｅｘａｍｐｌｅ", createdTimestamp: 100 } });
		const pattern = /example/i;

		expect(patternFilter(member, pattern)).toBe(true);
		expect(patternFilter(member, pattern, false)).toBe(false);
	});

	it("rejects when pattern does not match", () => {
		expect(patternFilter(createMember(), /nomatch/)).toBe(false);
	});
});

describe("avatarFilter", () => {
	it("skips filtering when no avatar is provided", () => {
		expect(avatarFilter(createMember(), undefined)).toBe(true);
	});

	it("handles the none keyword", () => {
		expect(
			avatarFilter(
				createMember({ avatar: null, user: { username: "user", createdTimestamp: 0, avatar: null } }),
				"none",
			),
		).toBe(true);
		expect(
			avatarFilter(createMember({ user: { username: "user", createdTimestamp: 0, avatar: "avatar" } }), "NONE"),
		).toBe(false);
	});

	it("matches member or user avatar values", () => {
		expect(avatarFilter(createMember({ avatar: "match-me" }), "match-me")).toBe(true);
		expect(
			avatarFilter(
				createMember({ avatar: null, user: { username: "user", createdTimestamp: 0, avatar: "match-me" } }),
				"match-me",
			),
		).toBe(true);
	});
});

describe("zalgoFilter", () => {
	it("detects zalgo characters", () => {
		expect(zalgoFilter(createMember({ user: { username: "zal̄go", createdTimestamp: 0 } }))).toBe(true);
		expect(zalgoFilter(createMember({ user: { username: "clean", createdTimestamp: 0 } }))).toBe(false);
	});
});

describe("confusablesFilter", () => {
	it("detects confusable usernames", () => {
		expect(confusablesFilter(createMember({ user: { username: "ｅｘａｍｐｌｅ", createdTimestamp: 0 } }))).toBe(true);
		expect(confusablesFilter(createMember({ user: { username: "example", createdTimestamp: 0 } }))).toBe(false);
	});
});
