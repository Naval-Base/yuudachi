import { createHash } from "node:crypto";
import type { Snowflake } from "discord.js";
import type { Redis } from "ioredis";
import type { Dispatcher } from "undici";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SCAM_EXPIRE_SECONDS } from "../src/Constants.js";
import * as checkScamModule from "../src/functions/anti-scam/checkScam.js";
import { checkScam } from "../src/functions/anti-scam/checkScam.js";
import { checkResponse, refreshScamDomains, ScamRedisKeys } from "../src/functions/anti-scam/refreshScamDomains.js";
import { totalScams } from "../src/functions/anti-scam/totalScams.js";
import { mockContainerGet, mockLogger } from "./mocks.js";

const resolveRedirectMock = vi.hoisted(() => vi.fn<(url: string) => Promise<string>>());
const request = vi.hoisted(() =>
	vi.fn<(url: string, init?: Dispatcher.RequestOptions) => Promise<Dispatcher.ResponseData>>(),
);

vi.mock("undici", () => ({
	request,
}));

vi.mock("../src/util/resolveRedirect.js", () => ({
	resolveRedirect: resolveRedirectMock,
}));

type MultiStub = {
	del(key: string): MultiStub;
	exec(): Promise<[unknown, unknown][]>;
	get(key: string): MultiStub;
	sadd(key: string, ...members: string[]): MultiStub;
	scard(key: string): MultiStub;
	set(key: string, value: number): MultiStub;
};

const createMultiStub = (execValue: [unknown, unknown][]): MultiStub => {
	const stub: Partial<MultiStub> = {};
	stub.get = vi.fn(() => stub as MultiStub);
	stub.scard = vi.fn(() => stub as MultiStub);
	stub.del = vi.fn(() => stub as MultiStub);
	stub.sadd = vi.fn(() => stub as MultiStub);
	stub.set = vi.fn(() => stub as MultiStub);
	stub.exec = vi.fn(async () => execValue);
	return stub as MultiStub;
};

type RedisStub = {
	expire?(key: string, seconds: number): Promise<number>;
	incrby?(key: string, amount: number): Promise<number>;
	multi?(): MultiStub;
	sismember?(set: string, member: string): Promise<number>;
	smembers?(key: string): Promise<string[]>;
};

const asRedis = (stub: RedisStub): Redis => stub as unknown as Redis;

const envBackup = {
	SCAM_DOMAIN_URL: process.env.SCAM_DOMAIN_URL,
	SCAM_DOMAIN_DISCORD_URL: process.env.SCAM_DOMAIN_DISCORD_URL,
	SCAM_DOMAIN_IDENTITY: process.env.SCAM_DOMAIN_IDENTITY,
};

beforeEach(() => {
	request.mockReset();
	resolveRedirectMock.mockReset();
});

afterEach(() => {
	process.env.SCAM_DOMAIN_URL = envBackup.SCAM_DOMAIN_URL;
	process.env.SCAM_DOMAIN_DISCORD_URL = envBackup.SCAM_DOMAIN_DISCORD_URL;
	process.env.SCAM_DOMAIN_IDENTITY = envBackup.SCAM_DOMAIN_IDENTITY;
});

describe("checkResponse", () => {
	it("returns response for 2xx codes", () => {
		const response = { statusCode: 204 } as Dispatcher.ResponseData;

		expect(checkResponse(response)).toBe(response);
	});

	it("logs and returns null for non-2xx codes", () => {
		const response = { statusCode: 500 } as Dispatcher.ResponseData;

		expect(checkResponse(response)).toBeNull();
		expect(mockLogger.warn).toHaveBeenCalledWith(
			{ response },
			"Fetching scam domains returned a non 2xx response code.",
		);
	});
});

describe("refreshScamDomains", () => {
	it("warns when environment variables are missing", async () => {
		delete process.env.SCAM_DOMAIN_URL;
		delete process.env.SCAM_DOMAIN_DISCORD_URL;

		const redis = {
			multi: vi.fn(() => createMultiStub([])),
			smembers: vi.fn(),
			sismember: vi.fn(),
			incrby: vi.fn(),
			expire: vi.fn(),
		} satisfies RedisStub;

		await expect(refreshScamDomains(asRedis(redis))).resolves.toEqual([]);
		expect(mockLogger.warn).toHaveBeenCalledWith("Missing env var: SCAM_DOMAIN_URL");
		expect(mockLogger.warn).toHaveBeenCalledWith("Missing env var: SCAM_DOMAIN_DISCORD_URL");
		expect(request).not.toHaveBeenCalled();
	});

	it("skips discord domain refresh when identity is missing", async () => {
		process.env.SCAM_DOMAIN_URL = "https://scams.test/domains";
		process.env.SCAM_DOMAIN_DISCORD_URL = "https://scams.test/discord-domains";
		delete process.env.SCAM_DOMAIN_IDENTITY;

		const execValue: [unknown, unknown][] = [
			[null, `${Date.now() - 1_000}`],
			[null, 0],
			[null, 0],
			[null, 0],
			[null, 1],
			[null, "OK"],
		];
		const multiStub = createMultiStub(execValue);
		const redis = {
			multi: vi.fn(() => multiStub),
			smembers: vi.fn(),
			sismember: vi.fn(),
			incrby: vi.fn(),
			expire: vi.fn(),
		} satisfies RedisStub;

		request.mockResolvedValue({
			statusCode: 200,
			body: { json: async () => ["scam.test"] },
		} as unknown as Dispatcher.ResponseData);

		await expect(refreshScamDomains(asRedis(redis))).resolves.toHaveLength(1);
		expect(request).toHaveBeenCalledTimes(1);
		expect(mockLogger.warn).toHaveBeenCalledWith(
			"Missing env var 'SCAM_DOMAIN_IDENTITY' to fetch SCAM_DOMAIN_DISCORD_URL",
		);
	});

	it("logs and ignores non-success responses", async () => {
		process.env.SCAM_DOMAIN_URL = "https://scams.test/domains";
		process.env.SCAM_DOMAIN_DISCORD_URL = "https://scams.test/discord-domains";
		process.env.SCAM_DOMAIN_IDENTITY = "identity";

		const redis = {
			multi: vi.fn(() => createMultiStub([])),
			smembers: vi.fn(),
			sismember: vi.fn(),
			incrby: vi.fn(),
			expire: vi.fn(),
		} satisfies RedisStub;

		request.mockResolvedValue({
			statusCode: 502,
			body: { json: async () => [] },
		} as unknown as Dispatcher.ResponseData);

		await expect(refreshScamDomains(asRedis(redis))).resolves.toEqual([]);
		expect(request).toHaveBeenCalledTimes(2);
		expect(mockLogger.warn).toHaveBeenCalled();
		expect(redis.multi).not.toHaveBeenCalled();
	});

	it("stores refreshed domain lists in redis", async () => {
		process.env.SCAM_DOMAIN_URL = "https://scams.test/domains";
		process.env.SCAM_DOMAIN_DISCORD_URL = "https://scams.test/discord-domains";
		process.env.SCAM_DOMAIN_IDENTITY = "identity";

		const now = Date.now();
		const execValue: [unknown, unknown][] = [
			[null, `${now - 60_000}`],
			[null, 1],
			[null, 0],
			[null, 3],
			[null, 4],
			[null, "OK"],
		];
		const multiStub = createMultiStub(execValue);
		const redis = {
			multi: vi.fn(() => multiStub),
			smembers: vi.fn(),
			sismember: vi.fn(),
			incrby: vi.fn(),
			expire: vi.fn(),
		} satisfies RedisStub;

		request
			.mockResolvedValueOnce({
				statusCode: 200,
				body: { json: async () => ["scam.test"] },
			} as unknown as Dispatcher.ResponseData)
			.mockResolvedValueOnce({
				statusCode: 200,
				body: { json: async () => ["hash-value"] },
			} as unknown as Dispatcher.ResponseData);

		const result = await refreshScamDomains(asRedis(redis));

		expect(request).toHaveBeenCalledTimes(2);
		expect(redis.multi).toHaveBeenCalledTimes(2);
		expect(result).toEqual([
			{
				after: 4,
				before: 1,
				envVar: "SCAM_DOMAIN_URL",
				lastRefresh: now - 60_000,
				redisKey: ScamRedisKeys.SCAM_DOMAIN_URL,
			},
			{
				after: 4,
				before: 1,
				envVar: "SCAM_DOMAIN_DISCORD_URL",
				lastRefresh: now - 60_000,
				redisKey: ScamRedisKeys.SCAM_DOMAIN_DISCORD_URL,
			},
		]);
	});
});

describe("checkScam", () => {
	it("detects direct scam domains", async () => {
		const redis = {
			smembers: vi.fn(async (key: string) => (key === ScamRedisKeys.SCAM_DOMAIN_URL ? ["malicious.test"] : [])),
			sismember: vi.fn(async () => 0),
		} satisfies RedisStub;
		mockContainerGet.mockReturnValue(redis);

		const result = await checkScam("Check https://malicious.test now");

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			host: "malicious.test",
			lists: ["SCAM_DOMAIN_URL"],
		});
		expect(mockLogger.info).toHaveBeenCalledTimes(1);
	});

	it("follows link shorteners and matches hashed discord domains", async () => {
		const redirectHost = "discord.bad";
		const hashedRedirect = createHash("sha256").update(redirectHost).digest("hex");
		const redis = {
			smembers: vi.fn(async (key: string) => (key === ScamRedisKeys.SCAM_DOMAIN_DISCORD_URL ? [hashedRedirect] : [])),
			sismember: vi.fn(async (set: string, member: string) =>
				set === "linkshorteners" && member === "short.test" ? 1 : 0,
			),
		} satisfies RedisStub;
		mockContainerGet.mockReturnValue(redis);
		resolveRedirectMock.mockResolvedValue(`https://${redirectHost}/landing`);

		const result = await checkScam("visit http://short.test right now");

		expect(resolveRedirectMock).toHaveBeenCalledWith("http://short.test/");
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			host: redirectHost,
			lists: ["SCAM_DOMAIN_DISCORD_URL"],
		});
	});

	it("logs and suppresses redirect resolution failures", async () => {
		const redis = {
			smembers: vi.fn(async () => [] as string[]),
			sismember: vi.fn(async () => 1),
		} satisfies RedisStub;
		mockContainerGet.mockReturnValue(redis);
		resolveRedirectMock.mockRejectedValue(new Error("network down"));

		await expect(checkScam("http://short.test")).resolves.toEqual([]);
		expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), "network down");
	});
});

describe("totalScams", () => {
	it("increments scam counter when matches are found", async () => {
		const redis = {
			incrby: vi.fn(async () => 2),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		mockContainerGet.mockReturnValue(redis);

		const checkSpy = vi
			.spyOn(checkScamModule, "checkScam")
			.mockResolvedValue([{ full: "https://malicious.test", host: "malicious.test", lists: ["SCAM_DOMAIN_URL"] }]);

		await expect(totalScams("message", "1" as Snowflake, "2" as Snowflake)).resolves.toBe(2);
		expect(checkSpy).toHaveBeenCalled();
		expect(redis.incrby).toHaveBeenCalledWith("guild:1:user:2:scams", 1);
		expect(redis.expire).toHaveBeenCalledWith("guild:1:user:2:scams", SCAM_EXPIRE_SECONDS);
		checkSpy.mockRestore();
	});

	it("does not increment when no scam domains are found", async () => {
		const redis = {
			incrby: vi.fn(async () => 0),
			expire: vi.fn(async () => 1),
		} satisfies RedisStub;
		mockContainerGet.mockReturnValue(redis);

		const checkSpy = vi.spyOn(checkScamModule, "checkScam").mockResolvedValue([]);

		await expect(totalScams("clean content", "10" as Snowflake, "20" as Snowflake)).resolves.toBe(0);
		expect(checkSpy).toHaveBeenCalled();
		expect(redis.incrby).toHaveBeenCalledWith("guild:10:user:20:scams", 0);
		expect(redis.expire).toHaveBeenCalledWith("guild:10:user:20:scams", SCAM_EXPIRE_SECONDS);
		checkSpy.mockRestore();
	});
});
