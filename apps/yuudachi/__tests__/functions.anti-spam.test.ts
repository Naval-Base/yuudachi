import { createHash } from "node:crypto";
import type { Snowflake } from "discord.js";
import { describe, expect, it, vi } from "vitest";
import {
	ATTACHMENT_EXPIRE_SECONDS,
	INTERACTION_SPAM_EXPIRE_SECONDS,
	MENTION_EXPIRE_SECONDS,
	SPAM_EXPIRE_SECONDS,
} from "../src/Constants.js";
import {
	createAttachmentHash,
	isMediaAttachment,
	normalizeAttachmentUrl,
	totalAttachmentDuplicates,
	totalAttachmentUploads,
} from "../src/functions/anti-spam/totalAttachments.js";
import { createContentHash, normalizeContentForHash, totalContents } from "../src/functions/anti-spam/totalContents.js";
import { totalInteractionMessages } from "../src/functions/anti-spam/totalInteractions.js";
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

	it("normalizes discord CDN URLs by stripping query/hash parameters", () => {
		const base = "https://cdn.discordapp.com/attachments/1/2/image.png";
		expect(createContentHash(`look ${base}?ex=1&is=2&hm=3&`)).toBe(createContentHash(`look ${base}?ex=9&is=8&hm=7&`));
	});

	it("does not normalize query parameters for non-discord URLs", () => {
		expect(createContentHash("https://example.com/a?x=1")).not.toBe(createContentHash("https://example.com/a?x=2"));
	});

	it("keeps trailing punctuation when normalizing discord CDN URLs in content", () => {
		const base = "https://cdn.discordapp.com/attachments/1/2/image.png";
		const input = `look (${base}?ex=1&is=2&hm=3&)`;
		expect(normalizeContentForHash(input)).toBe(`look (${base})`);

		// And query changes still collapse to the same content hash (even with trailing ')')
		expect(createContentHash(`look (${base}?ex=1&is=2&hm=3&)`)).toBe(
			createContentHash(`look (${base}?ex=9&is=8&hm=7&)`),
		);
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

describe("isMediaAttachment", () => {
	it("detects images and videos via contentType and extension", () => {
		expect(
			isMediaAttachment({ url: "https://cdn.discordapp.com/attachments/x/y/test.png", contentType: "image/png" }),
		).toBe(true);
		expect(isMediaAttachment({ url: "https://cdn.discordapp.com/attachments/x/y/test.mp4", name: "test.mp4" })).toBe(
			true,
		);
		expect(
			isMediaAttachment({ url: "https://cdn.discordapp.com/attachments/x/y/test.txt", contentType: "text/plain" }),
		).toBe(false);
	});
});

describe("normalizeAttachmentUrl", () => {
	it("strips query/hash and canonicalizes media.discordapp.net", () => {
		const url =
			"https://media.discordapp.net/attachments/1/2/image.png?ex=694099d7&is=693f4857&hm=c9e2b2e0bb21398924eae260ca6cf202a76d5fe97e9c2fa575f3661a82ddeb84&";
		expect(normalizeAttachmentUrl(url)).toBe("https://cdn.discordapp.com/attachments/1/2/image.png");
	});
});

describe("totalAttachmentUploads", () => {
	it("increments media attachment count and sets expiry", async () => {
		const redis = {
			incrby: vi.fn(async () => 3),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		const guildId = "1" as Snowflake;
		const userId = "2" as Snowflake;
		const redisKey = `guild:${guildId}:user:${userId}:attachments`;
		mockContainerGet.mockReturnValue(redis);

		await expect(totalAttachmentUploads(guildId, userId, 3)).resolves.toBe(3);
		expect(redis.incrby).toHaveBeenCalledWith(redisKey, 3);
		expect(redis.expire).toHaveBeenCalledWith(redisKey, ATTACHMENT_EXPIRE_SECONDS);
	});
});

describe("totalInteractionMessages", () => {
	it("increments interaction message count and sets expiry", async () => {
		const redis = {
			incr: vi.fn(async () => 1),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		const guildId = "1" as Snowflake;
		const userId = "2" as Snowflake;
		const redisKey = `guild:${guildId}:user:${userId}:interactions`;
		mockContainerGet.mockReturnValue(redis);

		await expect(totalInteractionMessages(guildId, userId)).resolves.toBe(1);
		expect(redis.incr).toHaveBeenCalledWith(redisKey);
		expect(redis.expire).toHaveBeenCalledWith(redisKey, INTERACTION_SPAM_EXPIRE_SECONDS);
	});
});

describe("createAttachmentHash / totalAttachmentDuplicates", () => {
	it("hashes attachment content via range request and increments duplicate counters", async () => {
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
			const headers = init?.headers;
			const range =
				headers instanceof Headers
					? headers.get("Range")
					: Array.isArray(headers)
						? headers.find(([key]) => key.toLowerCase() === "range")?.[1]
						: (headers?.Range ?? headers?.range);

			expect(range).toBe("bytes=0-4");
			return new Response("hello", { status: 206 });
		});
		vi.stubGlobal("fetch", fetchMock);

		try {
			const counts = new Map<string, number>();
			const redis = {
				incr: vi.fn(async (key: string) => {
					const next = (counts.get(key) ?? 0) + 1;
					counts.set(key, next);
					return next;
				}),
				expire: vi.fn(async () => 1),
			} satisfies RedisStub;
			mockContainerGet.mockReturnValue(redis);

			const guildId = "1" as Snowflake;
			const userId = "2" as Snowflake;
			const attachments = [
				{
					url: "https://cdn.discordapp.com/attachments/1/2/test.png",
					contentType: "image/png",
					name: "test.png",
					size: 5,
				},
				{
					url: "https://cdn.discordapp.com/attachments/1/2/test.png",
					contentType: "image/png",
					name: "test.png",
					size: 5,
				},
			];

			const expectedHash = createHash("sha256").update("hello").digest("hex");
			await expect(createAttachmentHash(attachments[0]!)).resolves.toBe(expectedHash);

			const { maxDuplicateCount, attachmentHashes } = await totalAttachmentDuplicates(guildId, userId, attachments);
			expect(maxDuplicateCount).toBe(2);
			expect(attachmentHashes).toEqual([expectedHash, expectedHash]);

			const redisKey = `guild:${guildId}:user:${userId}:attachmenthash:${expectedHash}`;
			expect(redis.incr).toHaveBeenCalledWith(redisKey);
			expect(redis.expire).toHaveBeenCalledWith(redisKey, ATTACHMENT_EXPIRE_SECONDS);
		} finally {
			vi.unstubAllGlobals();
		}
	});
});
