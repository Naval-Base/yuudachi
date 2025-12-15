import { createHash } from "node:crypto";
import { kRedis, container } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { Redis } from "ioredis";
import { SPAM_EXPIRE_SECONDS } from "../../Constants.js";

const DISCORD_CDN_HOSTS = new Set(["cdn.discordapp.com", "media.discordapp.net"]);

const URL_PATTERN = /https?:\/\/\S+/gi;

const TRAILING_URL_PUNCTUATION = new Set([")", "]", "}", ">", ".", ",", "!", "?", ";", ":", "'", '"']);

function normalizeDiscordCdnUrlForHash(input: string) {
	try {
		const parsed = new URL(input);
		const host = parsed.hostname.toLowerCase();

		if (!DISCORD_CDN_HOSTS.has(host)) {
			return input;
		}

		if (host === "media.discordapp.net") {
			parsed.hostname = "cdn.discordapp.com";
		}

		parsed.hash = "";
		parsed.search = "";
		return parsed.href;
	} catch {
		const lower = input.toLowerCase();
		if (lower.includes("cdn.discordapp.com/") || lower.includes("media.discordapp.net/")) {
			return input.split(/[#?]/)[0] ?? input;
		}

		return input;
	}
}

function splitTrailingPunctuation(urlCandidate: string) {
	let url = urlCandidate;
	let suffix = "";

	while (url.length) {
		const last = url.at(-1);
		if (!last || !TRAILING_URL_PUNCTUATION.has(last)) {
			break;
		}

		const trimmed = url.slice(0, -1);

		try {
			new URL(trimmed);
			suffix = last + suffix;
			url = trimmed;
			continue;
		} catch {
			break;
		}
	}

	return { url, suffix };
}

export function normalizeContentForHash(content: string) {
	return content.replaceAll(URL_PATTERN, (match) => {
		const { url, suffix } = splitTrailingPunctuation(match);
		return normalizeDiscordCdnUrlForHash(url) + suffix;
	});
}

export function createContentHash(content: string) {
	const normalized = normalizeContentForHash(content.trim()).toLowerCase();
	return createHash("md5").update(normalized).digest("hex");
}

export async function totalContents(guildId: Snowflake, userId: Snowflake, content: string) {
	const redis = container.get<Redis>(kRedis);

	const contentHash = createContentHash(content);

	const channelSpamKey = `guild:${guildId}:user:${userId}:contenthash:${contentHash}`;
	const total = await redis.incr(channelSpamKey);
	await redis.expire(channelSpamKey, SPAM_EXPIRE_SECONDS);

	return total;
}
