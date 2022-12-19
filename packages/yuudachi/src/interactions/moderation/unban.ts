import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { CASE_REASON_MAX_LENGTH, CASE_REASON_MIN_LENGTH } from "../../Constants.js";

export const UnbanCommand = {
	name: "unban",
	description: "Unban a user",
	options: [
		{
			name: "user",
			description: "The user to action",
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: "reason",
			description: "The reason of this action",
			type: ApplicationCommandOptionType.String,
			min_length: CASE_REASON_MIN_LENGTH,
			max_length: CASE_REASON_MAX_LENGTH,
		},
	],
	default_member_permissions: "0",
} as const;
