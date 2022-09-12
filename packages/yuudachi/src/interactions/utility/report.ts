import { ApplicationCommandOptionType } from "discord-api-types/v10";

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
