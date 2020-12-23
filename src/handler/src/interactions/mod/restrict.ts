export default {
	name: 'restrict',
	description: 'Restrict a members access to write/tags/embed/react/emoji',
	options: [
		{
			name: 'mute',
			description: 'Mute a member of(f) this guild',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'The user to action',
					type: 3,
					required: true,
				},
				{
					name: 'duration',
					description: 'The duration',
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
		},
		{
			name: 'embed',
			description: 'Embed restrict a member of(f) this guild',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'The user to action',
					type: 3,
					required: true,
				},
				{
					name: 'duration',
					description: 'The duration',
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
		},
		{
			name: 'react',
			description: 'Reaction restrict a member of(f) this guild',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'The user to action',
					type: 3,
					required: true,
				},
				{
					name: 'duration',
					description: 'The duration',
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
		},
		{
			name: 'emoji',
			description: 'Emoji restrict a member of(f) this guild',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'The user to action',
					type: 3,
					required: true,
				},
				{
					name: 'duration',
					description: 'The duration',
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
		},
		{
			name: 'tag',
			description: 'Tag restrict a member of(f) this guild',
			type: 1,
			options: [
				{
					name: 'user',
					description: 'The user to action',
					type: 3,
					required: true,
				},
				{
					name: 'duration',
					description: 'The duration',
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
		},
		{
			name: 'unrole',
			description: 'Unrole a specific case',
			type: 1,
			options: [
				{
					name: 'case',
					description: 'The case to unrole',
					type: 4,
					required: true,
				},
			],
		},
	],
};
