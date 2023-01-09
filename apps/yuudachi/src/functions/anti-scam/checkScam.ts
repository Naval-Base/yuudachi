import { createHash } from "node:crypto";
import { URL } from "node:url";
import { logger, kRedis, container } from "@yuudachi/framework";
import type { Redis } from "ioredis";
import { resolveRedirect } from "../../util/resolveRedirect.js";
import { ScamRedisKeys, scamURLEnvs } from "./refreshScamDomains.js";

type ScamDomainHit = {
	full: string;
	host: string;
	lists: string[];
};

const scamDomainChecks = {
	SCAM_DOMAIN_URL: (url: URL, host: string) => `.${url.host}`.endsWith(`.${host}`),
	SCAM_DOMAIN_DISCORD_URL: (url: URL, hash: string) => {
		const inHash = createHash("sha256").update(url.host).digest("hex");

		return hash === inHash;
	},
};

function urlOption(url: string) {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

async function checkDomain(redis: Redis, url: URL): Promise<ScamDomainHit | null> {
	const listHits: string[] = [];

	for (const urlEnv of scamURLEnvs) {
		const list = await redis.smembers(ScamRedisKeys[urlEnv]);
		const hit = list.find((entry) => scamDomainChecks[urlEnv](url, entry));

		if (hit) {
			listHits.push(urlEnv);
		}
	}

	return listHits.length
		? {
				lists: listHits,
				host: url.host,
				full: url.href,
		  }
		: null;
}

export async function checkScam(content: string) {
	const redis = container.resolve<Redis>(kRedis);

	const linkRegex =
		/https?:\/\/(?:www\.|(?!www))[\da-z][\da-z-]+[\da-z]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[\da-z]+\.\S{2,}/gi;

	let matches: any[] | null = [];
	const trippedDomains: ScamDomainHit[] = [];

	while ((matches = linkRegex.exec(content)) !== null) {
		const url = urlOption(matches[0]);

		if (!url) {
			continue;
		}

		const hit = await checkDomain(redis, url);

		if (hit) {
			trippedDomains.push(hit);
		}

		if (!(await redis.sismember("linkshorteners", url.host))) {
			continue;
		}

		try {
			const resolvedRedirect = await resolveRedirect(url.href);
			const resolved = urlOption(resolvedRedirect);

			if (!resolved) {
				continue;
			}

			const isHit = await checkDomain(redis, resolved);

			if (!isHit) {
				continue;
			}

			trippedDomains.push(isHit);
		} catch (error_) {
			const error = error_ as Error;
			logger.error(error, error.message);
		}
	}

	if (trippedDomains.length) {
		logger.info({
			msg: "Found scam domains",
			content,
			trippedDomains,
		});
	}

	return trippedDomains;
}
