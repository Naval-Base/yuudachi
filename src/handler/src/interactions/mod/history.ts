export default {
	name: 'history',
	description: 'Look up a users moderative history',
	options: [
		{
			name: 'user',
			description: 'The user to look up',
			type: 3,
			required: true,
		},
	],
};
