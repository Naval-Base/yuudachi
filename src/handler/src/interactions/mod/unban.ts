export default {
	name: 'unban',
	description: 'Unban a user',
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
			name: 'reference',
			description: 'The reference case',
			type: 4,
		},
	],
};
