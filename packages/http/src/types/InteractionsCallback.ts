import type { API } from "@discordjs/core";
import type { APIInteraction, APIInteractionResponse } from "discord-api-types/v10";
import type { FastifyReply } from "fastify";

export type InteractionsCallback = ({
	interaction,
	api,
	reply,
}: {
	api: API;
	interaction: APIInteraction;
	reply: FastifyReply;
}) => APIInteractionResponse | Promise<APIInteractionResponse>;
