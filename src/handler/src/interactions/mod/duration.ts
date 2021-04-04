export default {
	name: 'duration',
	description: 'Change the duration of a timed action',
	options: [
		{
			name: 'case',
			description: 'The case to look up',
			type: 4,
			required: true,
		},
		{
			name: 'duration',
			description: 'The duration',
			type: 3,
			choices: [
				{ name: '3 hours', value: '3h' },
				{ name: '6 hours', value: '6h' },
				{ name: '12 hours', value: '12h' },
				{ name: '1 day', value: '1d' },
				{ name: '2 days', value: '2d' },
				{ name: '3 days', value: '3d' },
				{ name: '7 days', value: '7d' },
			],
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: 5,
		},
	],
};
