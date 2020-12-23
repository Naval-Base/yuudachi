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
		},
	],
};
