import { beforeEach, describe, expect, it, vi } from "vitest";
import { extendMemberLock, tryAcquireMemberLock } from "../src/util/memberLock.js";
import { mockContainerGet } from "./mocks.js";

const set = vi.fn();
const expire = vi.fn();
const redis = { set, expire };

const guildId = "1";
const memberId = "2";

beforeEach(() => {
	set.mockReset();
	expire.mockReset();
	mockContainerGet.mockReturnValue(redis);
});

describe("tryAcquireMemberLock", () => {
	it("returns true when redis set succeeds", async () => {
		set.mockResolvedValue("OK");

		await expect(tryAcquireMemberLock(guildId, memberId)).resolves.toBe(true);
		expect(set).toHaveBeenCalledWith("guild:1:user:2:lock", expect.any(String), "EX", 30, "NX");
	});

	it("returns false when redis set fails", async () => {
		set.mockResolvedValue(null);

		await expect(tryAcquireMemberLock(guildId, memberId)).resolves.toBe(false);
	});
});

describe("extendMemberLock", () => {
	it("extends ttl for existing lock", async () => {
		await extendMemberLock(guildId, memberId);

		expect(expire).toHaveBeenCalledWith("guild:1:user:2:lock", 30);
	});
});
