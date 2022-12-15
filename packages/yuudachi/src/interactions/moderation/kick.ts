import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { CASE_REASON_MAX_LENGTH, CASE_REASON_MIN_LENGTH } from "../../Constants.js";

export const KickCommand = {
	name: "kick",
	description: "Kick a member of(f) this guild",
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
