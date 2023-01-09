import crypto from "node:crypto";
import process from "node:process";
import { verify } from "discord-verify/node";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function verifyRequest(
	req: FastifyRequest<{
		Headers: {
			"x-signature-ed25519": string;
			"x-signature-timestamp": string;
		};
	}>,
	res: FastifyReply,
) {
	const signature = req.headers["x-signature-ed25519"];
	const timestamp = req.headers["x-signature-timestamp"];
	const rawBody = JSON.stringify(req.body);

	const isValid = await verify(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!, crypto.webcrypto.subtle);

	if (!isValid) {
		return res.code(401).send("Invalid signature");
	}

	return true;
}
