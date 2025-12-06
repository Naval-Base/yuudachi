import { container } from "tsyringe";
import { kRedis } from "./tokens.js";

export async function createRedis() {
	const Redis = await import("ioredis");

	// @ts-expect-error: This is callable
	// eslint-disable-next-line no-restricted-globals, n/prefer-global/process
	const redis = new Redis.default(process.env.REDISHOST!, { maxRetriesPerRequest: null });
	container.register(kRedis, { useValue: redis });
}
