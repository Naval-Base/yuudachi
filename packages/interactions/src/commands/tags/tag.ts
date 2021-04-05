export const TagCommand = {
	name: 'tag',
	description: 'Display a tag',
	options: [
		{
			name: 'name',
			description: 'The name of the tag to display',
			type: 3,
			required: true,
		},
	],
} as const;
