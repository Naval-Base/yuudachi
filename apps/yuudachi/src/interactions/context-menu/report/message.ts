import {
	ApplicationCommandType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const ReportMessageContextCommand = {
	name: "Report message",
	type: ApplicationCommandType.Message,
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
