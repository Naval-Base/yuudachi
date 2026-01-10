import { container } from "./container.js";
import { kRedis } from "./tokens.js";

export async function createRedis() {
	const Redis = await import("ioredis");

	// @ts-expect-error: This is callable
	const redis = new Redis.default(process.env.REDISHOST!, { maxRetriesPerRequest: null });
	container.bind({ provide: kRedis, useValue: redis });
}
