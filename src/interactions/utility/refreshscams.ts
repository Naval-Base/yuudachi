import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const RefreshScamlistCommand = {
	name: 'refreshscams',
	description: 'Refresh scamlist',
	options: [
		{
			name: 'replace',
			description: 'If enabled, empties cache before refreshing',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;
