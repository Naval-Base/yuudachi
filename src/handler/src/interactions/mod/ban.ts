export default {
	name: 'ban',
	description: 'Ban a member of(f) this guild',
	options: [
		{
			name: 'user',
			description: 'The user to action',
			type: 3,
			required: true,
		},
		{
			name: 'reason',
			description: 'The reason of this action',
			type: 3,
		},
		{
			name: 'days',
			description: 'The amount of days to deleted messages from',
			type: 4,
			choices: [
				{ name: '0 days', value: 0 },
				{ name: '1 day', value: 1 },
				{ name: '2 days', value: 2 },
				{ name: '3 days', value: 3 },
				{ name: '4 days', value: 4 },
				{ name: '5 days', value: 5 },
				{ name: '6 days', value: 6 },
				{ name: '7 days', value: 7 },
			],
		},
		{
			name: 'reference',
			description: 'The reference case',
			type: 4,
		},
		{
			name: 'duration',
			description: 'The duration (if its a timed ban)',
			type: 3,
			choices: [
				{ name: '3 hours', value: '3h' },
				{ name: '6 hours', value: '6h' },
				{ name: '12 hours', value: '12h' },
				{ name: '1 day', value: '1d' },
				{ name: '2 days', value: '2d' },
				{ name: '3 days', value: '3d' },
			],
		},
	],
};
