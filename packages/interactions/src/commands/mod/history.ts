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
	],
} as const;
