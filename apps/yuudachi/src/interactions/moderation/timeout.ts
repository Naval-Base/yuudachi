import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { CASE_REASON_MAX_LENGTH, CASE_REASON_MIN_LENGTH } from "../../Constants.js";

export const TimeoutCommand = {
	name: "timeout",
	description: "Timeout a member",
	options: [
		{
			name: "user",
			description: "Timeout a member of this guild",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "duration",
			description: "The duration to time the user out for",
			type: ApplicationCommandOptionType.String,
			choices: [
				{ name: "1 minute", value: "60s" },
				{ name: "5 minutes", value: "5m" },
				{ name: "10 minutes", value: "10m" },
				{ name: "1 hour", value: "1h" },
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
		{
			name: "reason",
			description: "The reason of this timeout",
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			min_length: CASE_REASON_MIN_LENGTH,
			max_length: CASE_REASON_MAX_LENGTH,
		},
		{
			name: "case_reference",
			description: "The reference case",
			type: ApplicationCommandOptionType.Integer,
			autocomplete: true,
		},
		{
			name: "report_reference",
			description: "The reference report, if not provided, the latest report will be used",
			type: ApplicationCommandOptionType.Integer,
			autocomplete: true,
		},
	],
	default_member_permissions: "0",
} as const;
