import { createHash } from "node:crypto";
import { kRedis, container } from "@yuudachi/framework";
import type { Snowflake } from "discord.js";
import type { Redis } from "ioredis";
import {
	ATTACHMENT_EXPIRE_SECONDS,
	ATTACHMENT_FINGERPRINT_FULL_MAX_BYTES,
	ATTACHMENT_FINGERPRINT_MAX_PER_MESSAGE,
	ATTACHMENT_FINGERPRINT_PARTIAL_BYTES,
	ATTACHMENT_FINGERPRINT_TIMEOUT_MS,
} from "../../Constants.js";

export type AttachmentLike = {
	contentType?: string | null | undefined;
	name?: string | null | undefined;
	size?: number | null | undefined;
	url: string;
};

const MEDIA_EXTENSIONS = new Set([
	// Images
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"bmp",
	"tif",
	"tiff",
	"avif",
	// Videos
	"mp4",
	"webm",
	"mov",
	"mkv",
	"avi",
	"m4v",
]);

function getExtension(input: string | null | undefined) {
	if (!input) {
		return null;
	}

	const sanitized = input.split(/[#?]/)[0] ?? input;
	const idx = sanitized.lastIndexOf(".");
	if (idx === -1 || idx === sanitized.length - 1) {
		return null;
	}

	return sanitized.slice(idx + 1).toLowerCase();
}

function getExtensionFromUrl(url: string) {
	try {
		const parsed = new URL(url);
		return getExtension(parsed.pathname);
	} catch {
		return getExtension(url);
	}
}

export function normalizeAttachmentUrl(url: string) {
	try {
		const parsed = new URL(url);
		if (parsed.hostname.toLowerCase() === "media.discordapp.net") {
			parsed.hostname = "cdn.discordapp.com";
		}

		parsed.hash = "";
		parsed.search = "";
		return parsed.href;
	} catch {
		return url.split(/[#?]/)[0] ?? url;
	}
}

export function isMediaAttachment(attachment: AttachmentLike) {
	const ct = attachment.contentType?.toLowerCase() ?? "";
	if (ct.startsWith("image/") || ct.startsWith("video/")) {
		return true;
	}

	const ext = getExtension(attachment.name) ?? getExtensionFromUrl(attachment.url);
	return Boolean(ext && MEDIA_EXTENSIONS.has(ext));
}

function sha256Hex(input: Uint8Array | string) {
	const hash = createHash("sha256");
	hash.update(input);
	return hash.digest("hex");
}

async function readStreamLimited(stream: ReadableStream<Uint8Array> | null, maxBytes: number) {
	if (!stream || maxBytes <= 0) {
		return new Uint8Array();
	}

	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];
	let received = 0;

	while (received < maxBytes) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}

		if (!value || value.length === 0) {
			continue;
		}

		if (received + value.length > maxBytes) {
			chunks.push(value.subarray(0, maxBytes - received));
			received = maxBytes;
			try {
				await reader.cancel();
			} catch {
				// ignore
			}

			break;
		}

		chunks.push(value);
		received += value.length;
	}

	const out = new Uint8Array(received);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}

	return out;
}

async function fetchBytes(
	url: string,
	options: { maxBytes: number; range?: string | undefined; requireRange?: boolean | undefined; timeoutMs: number },
) {
	if (typeof fetch !== "function") {
		throw new TypeError("global fetch is not available");
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), options.timeoutMs);
	timeout.unref?.();

	try {
		const headers: Record<string, string> = { "User-Agent": "DiscordBot (https://discord.js.org, 2.5.0)" };
		if (options.range) {
			headers.Range = options.range;
		}

		const response = await fetch(url, { headers, signal: controller.signal });

		if (options.range && options.requireRange && response.status !== 206) {
			throw new Error(`Expected 206 Partial Content, got ${response.status}`);
		}

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		return await readStreamLimited(response.body, options.maxBytes);
	} finally {
		clearTimeout(timeout);
	}
}

/**
 * Creates a stable-ish fingerprint for an attachment by hashing content bytes:
 * - small files: hash full content (range request)
 * - large files: hash (size + prefix + suffix) (range requests)
 *
 * Falls back to hashing metadata if requests fail.
 */
export async function createAttachmentHash(attachment: AttachmentLike) {
	const requestUrl = attachment.url;
	const stableUrl = normalizeAttachmentUrl(requestUrl);
	const size = attachment.size ?? null;
	const contentType = attachment.contentType ?? "";
	const name = attachment.name ?? "";

	const fallback = () => sha256Hex(`${stableUrl}|${size ?? ""}|${contentType}|${name}`);

	if (!requestUrl) {
		return fallback();
	}

	if (typeof size !== "number" || size <= 0) {
		return fallback();
	}

	try {
		if (size <= ATTACHMENT_FINGERPRINT_FULL_MAX_BYTES) {
			const body = await fetchBytes(requestUrl, {
				range: `bytes=0-${size - 1}`,
				maxBytes: size,
				timeoutMs: ATTACHMENT_FINGERPRINT_TIMEOUT_MS,
				requireRange: true,
			});

			return sha256Hex(body);
		}

		const prefix = await fetchBytes(requestUrl, {
			range: `bytes=0-${ATTACHMENT_FINGERPRINT_PARTIAL_BYTES - 1}`,
			maxBytes: ATTACHMENT_FINGERPRINT_PARTIAL_BYTES,
			timeoutMs: ATTACHMENT_FINGERPRINT_TIMEOUT_MS,
			requireRange: true,
		});

		const suffixStart = Math.max(0, size - ATTACHMENT_FINGERPRINT_PARTIAL_BYTES);
		const suffix = await fetchBytes(requestUrl, {
			range: `bytes=${suffixStart}-${size - 1}`,
			maxBytes: ATTACHMENT_FINGERPRINT_PARTIAL_BYTES,
			timeoutMs: ATTACHMENT_FINGERPRINT_TIMEOUT_MS,
			requireRange: true,
		});

		const hash = createHash("sha256");
		hash.update(String(size));
		hash.update(prefix);
		hash.update(suffix);
		return hash.digest("hex");
	} catch {
		return fallback();
	}
}

export async function totalAttachmentUploads(guildId: Snowflake, userId: Snowflake, mediaAttachmentCount: number) {
	if (mediaAttachmentCount <= 0) {
		return 0;
	}

	const redis = container.get<Redis>(kRedis);
	const key = `guild:${guildId}:user:${userId}:attachments`;

	const total = await redis.incrby(key, mediaAttachmentCount);
	await redis.expire(key, ATTACHMENT_EXPIRE_SECONDS);

	return total;
}

export async function totalAttachmentDuplicates(
	guildId: Snowflake,
	userId: Snowflake,
	attachments: readonly AttachmentLike[],
) {
	const redis = container.get<Redis>(kRedis);

	let maxDuplicateCount = 0;
	const attachmentHashes: string[] = [];

	for (const attachment of attachments.slice(0, ATTACHMENT_FINGERPRINT_MAX_PER_MESSAGE)) {
		const hash = await createAttachmentHash(attachment);
		attachmentHashes.push(hash);

		const key = `guild:${guildId}:user:${userId}:attachmenthash:${hash}`;
		const total = await redis.incr(key);
		await redis.expire(key, ATTACHMENT_EXPIRE_SECONDS);
		if (total > maxDuplicateCount) {
			maxDuplicateCount = total;
		}
	}

	return { maxDuplicateCount, attachmentHashes };
}
