import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const ReferenceCommand = {
	name: "reference",
	description: "Set a reference of a moderation case",
	options: [
		{
			name: "case",
			description: "Set the case reference to another moderation case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The case to set a reference for",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					autocomplete: true,
				},
				{
					name: "reference_case",
					description: "The case to refer to",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					autocomplete: true,
				},
			],
		},
		{
			name: "report",
			description: "Set the case reference to a report",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The case to set a reference for",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					autocomplete: true,
				},
				{
					name: "reference_report",
					description: "The report to refer to",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					autocomplete: true,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const;
