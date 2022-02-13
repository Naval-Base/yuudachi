import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const HistoryCommand = {
	name: 'history',
	description: 'Look up a users moderative history',
	options: [
		{
			name: 'user',
			description: 'The user to look up',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
	default_permission: false,
} as const;
