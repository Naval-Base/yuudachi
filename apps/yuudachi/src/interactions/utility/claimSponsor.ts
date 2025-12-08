import {
	ApplicationCommandOptionType,
	InteractionContextType,
	type RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";

export const ClaimSponsorCommand = {
	name: "claim-sponsor",
	description: "Claim your sponsor role on this guild",
	description_localizations: {
		de: "Sponsorrolle für diese Gilde beanspruchen",
	},
	options: [
		{
			name: "slug",
			description: "Your open collective url slug. Found at Settings->Info->URL slug.",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	contexts: [InteractionContextType.Guild],
} as const satisfies RESTPostAPIApplicationCommandsJSONBody;
