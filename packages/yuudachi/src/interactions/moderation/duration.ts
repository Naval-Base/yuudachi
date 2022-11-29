import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const DurationCommand = {
	name: "duration",
	description: "Change the duration of a timed action",
	options: [
		{
			name: "case",
			description: "The case to look up",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			autocomplete: true,
		},
		{
			name: "duration",
			description: "The duration",
			type: ApplicationCommandOptionType.String,
			choices: [
				{ name: "3 hours", value: "3h" },
				{ name: "6 hours", value: "6h" },
				{ name: "12 hours", value: "12h" },
				{ name: "1 day", value: "1d" },
				{ name: "2 days", value: "2d" },
				{ name: "3 days", value: "3d" },
				{ name: "7 days", value: "7d" },
			],
			required: true,
		},
	],
	default_member_permissions: "0",
} as const;
