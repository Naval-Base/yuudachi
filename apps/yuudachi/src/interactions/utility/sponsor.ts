import {
	ApplicationCommandOptionType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const SponsorCommand = {
	name: "sponsor",
	description: "Add sponsor role to a member of this guild",
	description_localizations: {
		de: "Sponsorrolle für ein Mitglied dieser Gilde hinzufügen",
	},
	options: [
		{
			name: "user",
			description: "The user to action",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
	],
	default_member_permissions: "0",
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
