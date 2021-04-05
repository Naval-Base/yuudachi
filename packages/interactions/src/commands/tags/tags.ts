export const TagsCommand = {
	name: 'tags',
	description: 'Encapsulates tag subcommands',
	options: [
		{
			name: 'search',
			description: 'Search tags based on a query',
			type: 1,
			options: [
				{
					name: 'query',
					description: 'The query',
					type: 3,
					required: true,
				},
			],
		},
	],
} as const;
