import type { API } from "@discordjs/core";
import type { APIInteractionResponse } from "discord-api-types/v10";
import type { FastifyReply } from "fastify";
import type { APIInteractions } from "./APIInteractions.js";

export type InteractionsCallback = ({
	interaction,
	api,
	reply,
}: {
	api: API;
	interaction: APIInteractions;
	reply: FastifyReply;
}) => APIInteractionResponse | Promise<APIInteractionResponse>;
