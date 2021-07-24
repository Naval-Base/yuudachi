import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const ReferenceCommand = {
	name: 'reference',
	description: 'Change the reference of an action',
	options: [
		{
			name: 'case',
			description: 'The case to look up',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
		{
			name: 'reference',
			description: 'The reference case',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
	],
} as const;
