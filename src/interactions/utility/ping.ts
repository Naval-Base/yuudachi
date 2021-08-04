import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const PingCommand = {
	name: 'ping',
	description: 'Health check',
	options: [
		{
			name: 'hide',
			description: 'Hides the output',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
} as const;
