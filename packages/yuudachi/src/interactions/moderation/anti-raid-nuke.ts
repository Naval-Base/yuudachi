import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const AntiRaidNukeCommand = {
	name: 'anti-raid-nuke',
	description: 'Handle raids and nukes',
	options: [
		{
			name: 'filter',
			description: 'Filter and ban members based on various criterias',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'pattern',
					description: 'The pattern to match against the username',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'confusables',
					description: 'Enable confusables (Cleaning the username or filter out members without confusables)',
					type: ApplicationCommandOptionType.Integer,
					choices: [
						{ name: 'Off', value: 0 },
						{ name: 'Only pattern (default) (Pattern will be resistant to confusables and zalgo)', value: 1 },
						{ name: 'Only filter members (Filter out members without confusables in their username)', value: 2 },
						{ name: 'Pattern & filter members', value: 3 },
					],
				},
				{
					name: 'insensitive',
					description: 'The pattern should be case insensitive (default: true)',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'full_match',
					description: 'The pattern should only match the whole username (default: false)',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'zalgo',
					description: 'Filter out members without zalgo in their username',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'join_after',
					description: 'Minimum join date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'join_before',
					description: 'Maximum join date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'created_after',
					description: 'Minimum creation date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'created_before',
					description: 'Maximum creation date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'avatar',
					description: 'The avatar (Raw hash, user id, cdn url, or "none" to match no avatar)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'reason',
					description: 'The reason to ban the members',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'days',
					description: 'The amount of days to delete messages for',
					type: ApplicationCommandOptionType.Integer,
					choices: [
						{ name: '0 days', value: 0 },
						{ name: '1 day (default)', value: 1 },
						{ name: '2 days', value: 2 },
						{ name: '3 days', value: 3 },
						{ name: '4 days', value: 4 },
						{ name: '5 days', value: 5 },
						{ name: '6 days', value: 6 },
						{ name: '7 days', value: 7 },
					],
				},
				{
					name: 'hide',
					description: 'Hides the output (only enables dry-run)',
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
		{
			name: 'file',
			description: 'Filter and ban members from a file of ids',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'file',
					description: 'The file to read from',
					type: ApplicationCommandOptionType.Attachment,
					required: true,
				},
				{
					name: 'reason',
					description: 'The reason to ban the members',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'days',
					description: 'The amount of days to delete messages for',
					type: ApplicationCommandOptionType.Integer,
					choices: [
						{ name: '0 days', value: 0 },
						{ name: '1 day (default)', value: 1 },
						{ name: '2 days', value: 2 },
						{ name: '3 days', value: 3 },
						{ name: '4 days', value: 4 },
						{ name: '5 days', value: 5 },
						{ name: '6 days', value: 6 },
						{ name: '7 days', value: 7 },
					],
				},
				{
					name: 'hide',
					description: 'Hides the output',
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
		{
			name: 'modal',
			description: 'Filter and ban members prompted by a modal',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'reason',
					description: 'The reason to ban the members',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'days',
					description: 'The amount of days to delete messages for',
					type: ApplicationCommandOptionType.Integer,
					choices: [
						{ name: '0 days', value: 0 },
						{ name: '1 day (default)', value: 1 },
						{ name: '2 days', value: 2 },
						{ name: '3 days', value: 3 },
						{ name: '4 days', value: 4 },
						{ name: '5 days', value: 5 },
						{ name: '6 days', value: 6 },
						{ name: '7 days', value: 7 },
					],
				},
				{
					name: 'hide',
					description: 'Hides the output',
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
	],
	default_member_permissions: '0',
} as const;
