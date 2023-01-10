/* eslint-disable promise/prefer-await-to-callbacks */
import type { APIInteraction, APIInteractionResponse, APIInteractionResponsePong } from "discord-api-types/v10";
import { InteractionResponseType, InteractionType } from "discord-api-types/v10";
import type { FastifyInstance, FastifyRequest } from "fastify";
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
			if (!(await verifyRequest(request))) {
				// eslint-disable-next-line @typescript-eslint/no-throw-literal
				throw { statusCode: 401, message: "Invalid signature." };
			}

			const body = request.body as APIInteraction;

			if (body.type === InteractionType.Ping) {
				return { type: InteractionResponseType.Pong } satisfies APIInteractionResponsePong;
			}

			return fastify.httpHandlerOptions.interactionsCallback({ interaction: body, api: fastify.discord.api, reply });
		},
	);
}
