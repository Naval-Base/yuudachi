export default {
	name: 'debug',
	description: 'Debug',
	options: [
		{
			name: 'refresh',
			description: 'Refresh settings',
			type: 2,
			options: [
				{
					name: 'commands',
					description: 'Refresh slash commands',
					type: 1,
				},
			],
		},
	],
};
