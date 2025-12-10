import { verify } from "discord-verify/node";
import type { FastifyRequest } from "fastify";

export async function verifyRequest(
	req: FastifyRequest<{
		Headers: {
			"x-signature-ed25519": string;
			"x-signature-timestamp": string;
		};
	}> & {
		// eslint-disable-next-line n/prefer-global/buffer
		rawBody?: Buffer | string;
	},
) {
	const signature = req.headers["x-signature-ed25519"];
	const timestamp = req.headers["x-signature-timestamp"];
	const rawBody = typeof req.rawBody === "string" ? req.rawBody : req.rawBody?.toString("utf8");

	if (!signature || !timestamp || !rawBody) {
		return false;
	}

	// eslint-disable-next-line no-restricted-globals, n/prefer-global/process
	return verify(rawBody, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!, crypto.subtle);
}
