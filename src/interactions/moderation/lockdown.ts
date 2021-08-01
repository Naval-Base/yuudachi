import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const LockdownCommand = {
	name: 'lockdown',
	description: 'Execute or lift a lockdown on a text channel',
	options: [
		{
			name: 'lock',
			description: 'Execute a lockdown on a text channel',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'duration',
					description: 'The duration',
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: '1 hour', value: '1h' },
						{ name: '3 hours', value: '3h' },
						{ name: '6 hours', value: '6h' },
						{ name: '12 hours', value: '12h' },
						{ name: '1 day', value: '1d' },
						{ name: '2 days', value: '2d' },
						{ name: '3 days', value: '3d' },
					],
					required: true,
				},
				{
					name: 'channel',
					description: 'The channel to lock',
					type: ApplicationCommandOptionType.Channel,
				},
				{
					name: 'reason',
					description: 'The reason of this lockdown',
					type: ApplicationCommandOptionType.String,
				},
			],
		},
		{
			name: 'lift',
			description: 'Lift a lockdown on a text channel',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'channel',
					description: 'The channel to lift the lock',
					type: ApplicationCommandOptionType.Channel,
				},
			],
		},
	],
} as const;
