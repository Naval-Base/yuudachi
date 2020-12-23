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
					required: true,
				},
				{
					name: 'channel',
					description: 'The channel to lock',
					type: 3,
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
					type: 3,
				},
			],
		},
	],
};
