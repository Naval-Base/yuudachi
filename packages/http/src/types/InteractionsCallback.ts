import type { API } from "@discordjs/core";
import type { APIInteractionResponse } from "discord-api-types/v10";
import type { APIInteractions } from "./APIInteractions.js";

export type InteractionsCallback = ({
	interaction,
	api,
}: {
	api: API;
	interaction: APIInteractions;
}) => APIInteractionResponse | Promise<APIInteractionResponse>;
