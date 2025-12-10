import type { Snowflake } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import { MENTION_EXPIRE_SECONDS, SPAM_EXPIRE_SECONDS } from "../src/Constants.js";
import { createContentHash, totalContents } from "../src/functions/anti-spam/totalContents.js";
import { totalMentions } from "../src/functions/anti-spam/totalMentions.js";
import { mockContainerGet } from "./mocks.js";

type RedisStub = {
	expire?(key: string, seconds: number): Promise<number>;
	incr?(key: string): Promise<number>;
	incrby?(key: string, amount: number): Promise<number>;
};

describe("createContentHash", () => {
	it("hashes content case-insensitively", () => {
		expect(createContentHash("TeSt")).toBe("098f6bcd4621d373cade4e832627b4f6");
		expect(createContentHash("test")).toBe(createContentHash("TEST"));
	});
});

describe("totalContents", () => {
	it("increments content hash count and sets expiry", async () => {
		const redis = {
			incr: vi.fn(async () => 1),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		const guildId = "1" as Snowflake;
		const userId = "2" as Snowflake;
		const content = "Repeated message";
		const contentHash = createContentHash(content);
		const redisKey = `guild:${guildId}:user:${userId}:contenthash:${contentHash}`;
		mockContainerGet.mockReturnValue(redis);

		await expect(totalContents(guildId, userId, content)).resolves.toBe(1);
		expect(redis.incr).toHaveBeenCalledWith(redisKey);
		expect(redis.expire).toHaveBeenCalledWith(redisKey, SPAM_EXPIRE_SECONDS);
	});
});

describe("totalMentions", () => {
	it("counts unique mentions and @everyone and sets expiry on first hit", async () => {
		const redis = {
			incrby: vi.fn(async (_key, amount: number) => amount),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		const guildId = "10" as Snowflake;
		const userId = "20" as Snowflake;
		const content = "Hello <@123456789012345678> and @everyone and <@!123456789012345678> `code <@456>`";
		const redisKey = `guild:${guildId}:user:${userId}:mentions`;
		mockContainerGet.mockReturnValue(redis);

		await expect(totalMentions(guildId, userId, content)).resolves.toBe(2);
		expect(redis.incrby).toHaveBeenCalledWith(redisKey, 2);
		expect(redis.expire).toHaveBeenCalledWith(redisKey, MENTION_EXPIRE_SECONDS);
	});

	it("does not reset expiry when counter already existed", async () => {
		const redis = {
			incrby: vi.fn(async (_key, amount: number) => amount + 4),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		const guildId = "10" as Snowflake;
		const userId = "20" as Snowflake;
		const content = "<@123456789012345678> world";
		const redisKey = `guild:${guildId}:user:${userId}:mentions`;
		mockContainerGet.mockReturnValue(redis);

		await expect(totalMentions(guildId, userId, content)).resolves.toBe(5);
		expect(redis.incrby).toHaveBeenCalledWith(redisKey, 1);
		expect(redis.expire).not.toHaveBeenCalled();
	});
});
