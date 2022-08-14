import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const KickCommand = {
	name: "kick",
	description: "Kick a member of(f) this guild",
	options: [
		{
			name: "user",
			description: "The user to action",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "reason",
			description: "The reason of this action",
			type: ApplicationCommandOptionType.String,
		},
		{
			name: "case_reference",
			description: "The reference case",
			type: ApplicationCommandOptionType.Integer,
		},
		{
			name: "report_reference",
			description: "The reference report",
			type: ApplicationCommandOptionType.Integer,
		},
	],
	default_member_permissions: "0",
} as const;
