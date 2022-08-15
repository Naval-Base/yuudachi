import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const StatusCommand = {
	name: 'status',
	description: 'Change the status of a report',
	options: [
		{
			name: 'report',
			description: 'The report to update',
			type: ApplicationCommandOptionType.Integer,
			required: true,
		},
		{
			name: 'status',
			description: 'The new status for the report',
			type: ApplicationCommandOptionType.Integer,
			choices: [
				{ name: 'Pending', value: 0 },
				{ name: 'Accepted', value: 1 },
				{ name: 'Rejected', value: 2 },
				{ name: 'False', value: 3 },
			],
			required: true,
		},
	],
	default_member_permissions: '0',
} as const;
