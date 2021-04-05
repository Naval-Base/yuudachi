export const ReferenceCommand = {
	name: 'reference',
	description: 'Change the reference of an action',
	options: [
		{
			name: 'case',
			description: 'The case to look up',
			type: 4,
			required: true,
		},
		{
			name: 'reference',
			description: 'The reference case',
			type: 4,
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: 5,
		},
	],
} as const;
