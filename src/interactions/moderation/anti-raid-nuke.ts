import { ApplicationCommandOptionType } from 'discord-api-types/v9';

export const AntiRaidNukeCommand = {
	name: 'anti-raid-nuke',
	description: 'Bans all members that have joined recently, with new accounts',
	options: [
		{
			name: 'join',
			description: 'How old should a member be for the cybernuke to ignore them (server join date)?',
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'age',
			description: "How old should a member's account be for the cybernuke to ignore them (account age)?",
			type: ApplicationCommandOptionType.String,
			required: true,
		},
		{
			name: 'pattern',
			description: "A pattern the member's username should match (case insensitive, full match)",
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'reason',
			description: 'The reason of this action',
			type: ApplicationCommandOptionType.String,
		},
		{
			name: 'days',
			description: 'The amount of days to deleted messages from',
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
	],
	default_permission: false,
} as const;
