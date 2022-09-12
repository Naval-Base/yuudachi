import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const RepostCommand = {
	name: "repost",
	description: "Repost a message",
	options: [
		{
			name: "message_link",
			description: "Message link to the message",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
	default_member_permissions: "0",
} as const;
