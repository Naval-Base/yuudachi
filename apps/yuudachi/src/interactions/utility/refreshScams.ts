import { InteractionContextType, type RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export const RefreshScamlistCommand = {
	name: "refresh-scamlists",
	description: "Refresh scamlists",
	description_localizations: {
		de: "Betrugslisten aktualisieren",
	},
	options: [],
	default_member_permissions: "0",
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
