import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const ReasonCommand = {
	name: 'reason',
	description: 'Change the reason of actions',
	options: [
		{
			name: 'case',
			description: 'The first case to change',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'lastcase',
			description: 'The last case to change',
			type: ApplicationCommandOptionType.Integer,
		},
	],
	default_member_permissions: '0',
} as const;
