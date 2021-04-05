export const ReasonCommand = {
	name: 'reason',
	description: 'Change the reason of an action',
	options: [
		{
			name: 'case',
			description: 'The case to look up',
			type: 4,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason',
			type: 3,
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: 5,
		},
	],
} as const;
