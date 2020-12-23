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
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: 5,
		},
	],
};
