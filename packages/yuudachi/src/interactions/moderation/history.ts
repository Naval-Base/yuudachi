import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const HistoryCommand = {
	name: "history",
	description: "Look up a users moderative history",
	options: [
		{
			name: "user",
			description: "The user to look up",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "type",
			description: "The type of history to look up",
			type: ApplicationCommandOptionType.Integer,
			choices: [
				{ name: "Cases (default)", value: 0 },
				{ name: "Reports", value: 1 },
			],
		},
		{
			name: "hide",
			description: "Hides the output",
			type: ApplicationCommandOptionType.Boolean,
		},
	],
	default_member_permissions: "0",
} as const;
