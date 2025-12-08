import {
	ApplicationCommandOptionType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const PingCommand = {
	name: "ping",
	description: "Health check",
	description_localizations: {
		de: "Gesundheitscheck",
	},
	options: [
		{
			name: "hide",
			name_localizations: {
				de: "ausblenden",
			},
			description: "Hides the output",
			description_localizations: {
				de: "Blendet die Ausgabe aus",
			},
			type: ApplicationCommandOptionType.Boolean,
		},
	],
	default_member_permissions: "0",
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
