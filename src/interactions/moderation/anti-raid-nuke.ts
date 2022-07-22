import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const AntiRaidNukeCommand = {
	name: 'anti-raid-nuke',
	description: 'Handle raids and nukes',
	options: [
		{
			name: 'manual',
			description: 'Manually filters and bans members based on various criterias',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'pattern',
					description: 'The pattern to match against the username',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'confusables',
					description: 'Whether to use confusables',
					type: ApplicationCommandOptionType.Integer,
					choices: [
						{ name: 'Off', value: 0 },
						{ name: 'Only Pattern (Pattern will be resistant to confusables, Default)', value: 1 },
						{ name: 'Only Filter Members (Filter only members with confusables)', value: 2 },
						{ name: 'Pattern & Filter Members', value: 3 },
					],
				},
				{
					name: 'insensitive',
					description: 'Whether the pattern should be case insensitive (default: true)',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'full_match',
					description: 'Whether the pattern should only match the whole username (default: false)',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'zalgo',
					description: 'Whether to filter members with zalgo (default: false)',
					type: ApplicationCommandOptionType.Boolean,
				},
				{
					name: 'join_from',
					description: 'Minimum join date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'join_to',
					description: 'Maximum join date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'created_from',
					description: 'Minimum creation date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'created_to',
					description: 'Maximum creation date (Snowflake | Timestamp | Duration | ISO)',
					type: ApplicationCommandOptionType.String,
				},
				{
					name: 'avatar',
					description: 'The avatar hash (UserId, cdn url, or "none" to match no avatar)',
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
					description: 'Whether to hide the reply (default: true)',
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
		{
			name: 'file',
			description: 'Filters and bans members from a file of IDs',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'file',
					description: 'The file to read from (must be a .txt file)',
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
					description: 'Whether to hide the reply (default: true)',
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
		{
			name: 'modal',
			description: 'Filters and bans members prompted by a modal',
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
					description: 'Whether to hide the reply (default: true)',
					type: ApplicationCommandOptionType.Boolean,
				},
			],
		},
	],
	default_member_permissions: '0',
} as const;
