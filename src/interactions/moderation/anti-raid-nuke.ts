export const AntiRaidNukeCommand = {
	name: 'anti-raid-nuke',
	description: 'Bans all members that have joined recently, with new accounts',
	options: [
		{
			name: 'join',
			description: 'How old (in minutes) should a member be for the cybernuke to ignore them (server join date)?',
			type: 3,
			required: true,
		},
		{
			name: 'age',
			description: "How old (in minutes) should a member's account be for the cybernuke to ignore them (account age)?",
			type: 3,
			required: true,
		},
		{
			name: 'days',
			description: 'The amount of days to deleted messages from',
			type: 4,
			choices: [
				{ name: '0 days (default)', value: 0 },
				{ name: '1 day', value: 1 },
				{ name: '2 days', value: 2 },
				{ name: '3 days', value: 3 },
				{ name: '4 days', value: 4 },
				{ name: '5 days', value: 5 },
				{ name: '6 days', value: 6 },
				{ name: '7 days', value: 7 },
			],
		},
	],
} as const;
