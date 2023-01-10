import crypto from "node:crypto";
import process from "node:process";
import { verify } from "discord-verify/node";
import type { FastifyRequest } from "fastify";

export async function verifyRequest(
	req: FastifyRequest<{
		Headers: {
			"x-signature-ed25519": string;
			"x-signature-timestamp": string;
		};
	}>,
) {
	const signature = req.headers["x-signature-ed25519"];
	const timestamp = req.headers["x-signature-timestamp"];
	const rawBody = JSON.stringify(req.body);

	return verify(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!, crypto.webcrypto.subtle);
}
