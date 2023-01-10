/* eslint-disable promise/prefer-await-to-callbacks */
import type { APIInteractionResponse, APIInteractionResponsePong } from "discord-api-types/v10";
import { InteractionResponseType, InteractionType } from "discord-api-types/v10";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { APIInteractions } from "../types/index.js";
import { verifyRequest } from "../util/verifyRequest.js";

export default async function routes(fastify: FastifyInstance) {
	fastify.post(
		fastify.httpHandlerOptions.interactionsRoute ?? "/interactions",
		async (
			request: FastifyRequest<{
				Headers: {
					"x-signature-ed25519": string;
					"x-signature-timestamp": string;
				};
			}>,
			reply,
		): Promise<APIInteractionResponse> => {
			await verifyRequest(request, reply);

			const body = request.body as APIInteractions;

			if (body.type === InteractionType.Ping) {
				return { type: InteractionResponseType.Pong } satisfies APIInteractionResponsePong;
			}

			return fastify.httpHandlerOptions.interactionsCallback({ interaction: body, api: fastify.discord.api, reply });
		},
	);
}
