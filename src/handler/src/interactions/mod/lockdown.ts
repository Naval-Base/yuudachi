export default {
	name: 'lockdown',
	description: 'Execute or lift a lockdown on a text channel',
	options: [
		{
			name: 'lock',
			description: 'Execute a lockdown on a text channel',
			type: 1,
			options: [
				{
					name: 'duration',
					description: 'The duration',
					type: 3,
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
					type: 7,
				},
				{
					name: 'reason',
					description: 'The reason of this lockdown',
					type: 3,
				},
			],
		},
		{
			name: 'lift',
			description: 'Lift a lockdown on a text channel',
			type: 1,
			options: [
				{
					name: 'channel',
					description: 'The channel to lift the lock',
					type: 7,
				},
			],
		},
	],
};
