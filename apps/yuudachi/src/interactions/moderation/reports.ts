import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const ReportUtilsCommand = {
	name: "reports",
	description: "Mod reports utilities",
	options: [
		{
			name: "lookup",
			description: "Lookup a report",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "phrase",
					description: "Term to find a report by (report id, user id, part of user tag, part of reason)",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
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
			name: "status",
			description: "Change the status of a report",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "report",
					description: "The report to update",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					autocomplete: true,
				},
				{
					name: "status",
					description: "The new status for the report",
					type: ApplicationCommandOptionType.Integer,
					choices: [
						{ name: "Pending", value: 0 },
						{ name: "Approved", value: 1 },
						{ name: "Rejected", value: 2 },
						{ name: "Spam", value: 3 },
					],
					required: true,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const;
