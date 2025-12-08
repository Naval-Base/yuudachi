import {
	ApplicationCommandType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const ReportUserContextCommand = {
	name: "Report user",
	type: ApplicationCommandType.User,
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
