import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord-api-types/v10';

export const CaseLookupCommand = {
	name: 'case',
	description: 'Look up a moderation case',
	options: [
		{
			name: 'phrase',
			description: 'Search term to find the case by',
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
	default_member_permission: PermissionFlagsBits.BanMembers.toString(),
} as const;
