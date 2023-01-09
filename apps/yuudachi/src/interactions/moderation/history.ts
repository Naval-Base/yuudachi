import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const HistoryCommand = {
	name: "history",
	description: "Look up a users moderative history",
	options: [
		{
			name: "cases",
			description: "Look up a user case history",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to look up",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "hide",
					description: "Hides the output",
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
		{
			name: "reports",
			description: "Look up a user report history",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to look up",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "hide",
					description: "Hides the output",
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const;
