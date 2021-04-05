export const PingCommand = {
	name: 'ping',
	description: 'Health check',
	options: [
		{
			name: 'hide',
			description: 'Hides the output',
			type: 5,
		},
	],
} as const;
