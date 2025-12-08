import {
	ApplicationCommandOptionType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const CheckScamCommand = {
	name: "check-scam",
	description: "Check provided content for scam domains",
	description_localizations: {
		de: "Überprüfen Sie die bereitgestellten Inhalte auf betrügerische Domains",
	},
	options: [
		{
			name: "content",
			name_localizations: {
				de: "inhalt",
			},
			description: "String to check",
			description_localizations: {
				de: "Zu prüfende Zeichenfolge",
			},
			type: ApplicationCommandOptionType.String,
			required: true,
		},
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
