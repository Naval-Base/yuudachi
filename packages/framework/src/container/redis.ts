import process from "node:process";
import Redis from "ioredis";
import { container } from "tsyringe";
import { kRedis } from "./tokens.js";

export function createRedis() {
	// @ts-expect-error: This is callable
	const redis = new Redis(process.env.REDISHOST!, { maxRetriesPerRequest: null });
	container.register(kRedis, { useValue: redis });

	return redis;
}
