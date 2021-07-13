export const KickCommand = {
	name: 'kick',
	description: 'Kick a member of(f) this guild',
	options: [
		{
			name: 'user',
			description: 'The user to action',
			type: 6,
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
} as const;
