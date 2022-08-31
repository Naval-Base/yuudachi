import { ApplicationCommandType } from "discord-api-types/v10";

export const SponsorUserContextCommand = {
	name: "Assign sponsor",
	name_localizations: {
		de: "Vergebe sponsor",
	},
	type: ApplicationCommandType.User,
	default_member_permissions: "0",
} as const;
