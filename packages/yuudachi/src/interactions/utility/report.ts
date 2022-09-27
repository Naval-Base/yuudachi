import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { REPORT_REASON_MAX_LENGTH, REPORT_REASON_MIN_LENGTH } from "../../Constants.js";

export const ReportCommand = {
	name: "report",
	description: "Report a message to the server moderators",
	options: [
		{
			name: "message",
			description: "Report a message to the server moderators",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "message_link",
					description: "Message link to the message",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: "reason",
					description: "Reason for the report",
					type: ApplicationCommandOptionType.String,
					required: true,
					min_length: REPORT_REASON_MIN_LENGTH,
					max_length: REPORT_REASON_MAX_LENGTH,
				},
			],
		},
		{
			name: "user",
			description: "Report a user to the server moderators",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to report",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "reason",
					description: "Reason for the report",
					type: ApplicationCommandOptionType.String,
					required: true,
					min_length: REPORT_REASON_MIN_LENGTH,
					max_length: REPORT_REASON_MAX_LENGTH,
				},
				{
					name: "attachment",
					description: "Attachment to the report (image only)",
					type: ApplicationCommandOptionType.Attachment,
					required: false,
				},
			],
		},
	],
} as const;
