import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const SoftbanCommand = {
	name: 'softban',
	description: 'Softban a member of(f) this guild',
	options: [
		{
			name: 'user',
			description: 'The user to action',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason of this action',
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'days',
			description: 'The amount of days to deleted messages from',
			type: ApplicationCommandOptionType.Integer,
			choices: [
				{ name: '0 days', value: 0 },
				{ name: '1 day (default)', value: 1 },
				{ name: '2 days', value: 2 },
				{ name: '3 days', value: 3 },
				{ name: '4 days', value: 4 },
				{ name: '5 days', value: 5 },
				{ name: '6 days', value: 6 },
				{ name: '7 days', value: 7 },
			],
		},
		{
			name: 'reference',
			description: 'The reference case',
			type: ApplicationCommandOptionType.Integer,
		},
	],
} as const;
