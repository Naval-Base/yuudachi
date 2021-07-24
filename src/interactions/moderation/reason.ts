import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const ReasonCommand = {
	name: 'reason',
	description: 'Change the reason of an action',
	options: [
		{
			name: 'case',
			description: 'The case to look up',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
	],
} as const;
