export const HistoryCommand = {
	name: 'history',
	description: 'Look up a users moderative history',
	options: [
		{
			name: 'user',
			description: 'The user to look up',
			type: 6,
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: 5,
		},
	],
} as const;
