import { ApplicationCommandOptionType } from 'discord-api-types/v10';

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
			autocomplete: true,
		},
		{
			name: 'reference',
			description: 'The reference case',
			type: ApplicationCommandOptionType.Integer,
		},
	],
	default_member_permissions: '0',
} as const;
