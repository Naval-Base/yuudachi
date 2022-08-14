import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const ReferenceCommand = {
	name: "reference",
	description: "Change the reference of an action",
	options: [
		{
			name: "case",
			description: "Change the reference using a case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The case to look up",
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
				{
					name: "reference",
					description: "The reference case",
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
			],
		},
		{
			name: "report",
			description: "Change the reference using a report",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The case to look up",
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
				{
					name: "reference",
					description: "The reference report",
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const;
