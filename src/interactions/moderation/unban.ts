import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const UnbanCommand = {
	name: 'unban',
	description: 'Unban a user',
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
			name: 'reference',
			description: 'The reference case',
			type: ApplicationCommandOptionType.Integer,
		},
	],
} as const;
