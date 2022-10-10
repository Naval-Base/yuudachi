import process from "node:process";
import { container } from "tsyringe";
import { kRedis } from "./tokens.js";

export async function createRedis() {
	const Redis = await import("ioredis");

	// @ts-expect-error: This is callable
	const redis = new Redis.default(process.env.REDISHOST!, { maxRetriesPerRequest: null });
	container.register(kRedis, { useValue: redis });
}
