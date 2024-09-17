import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { REPORTS_RESTRICTION_REASON_MAX_LENGTH, REPORTS_RESTRICTION_REASON_MIN_LENGTH } from "../../Constants.js";

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
		{
			name: "update-restriction-level",
			description: "Update the restriction level all the future reports will have",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "level",
					description: "The new restriction level",
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: "Enabled", value: "enabled" },
						{ name: "Restricted (require confirmation)", value: "restricted" },
						{ name: "Blocked", value: "blocked" },
					],
					required: true,
				},
				{
					name: "reason",
					description: "The reason that will be shown to the user on restricted or blocked report attempts",
					min_length: REPORTS_RESTRICTION_REASON_MIN_LENGTH,
					max_length: REPORTS_RESTRICTION_REASON_MAX_LENGTH,
					type: ApplicationCommandOptionType.String,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const;
