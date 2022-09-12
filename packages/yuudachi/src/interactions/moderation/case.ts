import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const CaseLookupCommand = {
	name: "case",
	description: "Look up a moderation case",
	options: [
		{
			name: "phrase",
			description: "Term to find a case by (case id, target id, part of target tag, part of reason)",
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
	default_member_permissions: "0",
} as const;
