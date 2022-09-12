import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const ClearCommand = {
	name: "clear",
	description: "Clear messages",
	options: [
		{
			name: "last_message",
			description: "The last message to clear",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: "first_message",
			description: "The first message to clear",
			type: ApplicationCommandOptionType.String,
		},
	],
	default_member_permissions: "0",
} as const;
