import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { CASE_REASON_MAX_LENGTH, CASE_REASON_MIN_LENGTH } from "../../Constants.js";

export const RestrictCommand = {
	name: "restrict",
	description: "Restrict a members access to write/tags/embed/react/emoji",
	options: [
		{
			name: "embed",
			description: "Embed restrict a member of(f) this guild",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to action",
					type: ApplicationCommandOptionType.User,
					required: true,
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
				{
					name: "reason",
					description: "The reason of this action",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					min_length: CASE_REASON_MIN_LENGTH,
					max_length: CASE_REASON_MAX_LENGTH,
				},
				{
					name: "case_reference",
					description: "The reference case",
					type: ApplicationCommandOptionType.Integer,
				},
				{
					name: "report_reference",
					description: "The reference report, this will resolve all pending reports by this target",
					type: ApplicationCommandOptionType.Integer,
				},
			],
		},
		{
			name: "react",
			description: "Reaction restrict a member of(f) this guild",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to action",
					type: ApplicationCommandOptionType.User,
					required: true,
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
				{
					name: "reason",
					description: "The reason of this action",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					min_length: CASE_REASON_MIN_LENGTH,
					max_length: CASE_REASON_MAX_LENGTH,
				},
				{
					name: "case_reference",
					description: "The reference case",
					type: ApplicationCommandOptionType.Integer,
				},
				{
					name: "report_reference",
					description: "The reference report, this will resolve all pending reports by this target",
					type: ApplicationCommandOptionType.Integer,
				},
			],
		},
		{
			name: "emoji",
			description: "Emoji restrict a member of(f) this guild",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to action",
					type: ApplicationCommandOptionType.User,
					required: true,
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
				{
					name: "reason",
					description: "The reason of this action",
					type: ApplicationCommandOptionType.String,
					autocomplete: true,
					min_length: CASE_REASON_MIN_LENGTH,
					max_length: CASE_REASON_MAX_LENGTH,
				},
				{
					name: "case_reference",
					description: "The reference case",
					type: ApplicationCommandOptionType.Integer,
				},
				{
					name: "report_reference",
					description: "The reference report, this will resolve all pending reports by this target",
					type: ApplicationCommandOptionType.Integer,
				},
			],
		},
		{
			name: "unrole",
			description: "Unrole a specific case",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "case",
					description: "The case to unrole",
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
			],
		},
	],
	default_member_permissions: "0",
} as const;
