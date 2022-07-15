import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const UsernamesCommand = {
	name: 'username',
	description: 'Modify the list of banned usernames',
	options: [
		{
			name: 'add',
			description: 'Add an regex to the list of banned usernames',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'name',
					description: 'The name of the regex',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
				{
					name: 'regex',
					description: 'The regex to match',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
		{
			name: 'remove',
			description: 'Remove an regex to the list of banned usernames',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'query',
					description: 'The name or part of the regex to remove',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		},
	],
	default_member_permissions: '0',
} as const;
