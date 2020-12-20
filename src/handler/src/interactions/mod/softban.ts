export default {
	name: 'softban',
	description: 'Softban a member of(f) this guild',
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
	],
};
