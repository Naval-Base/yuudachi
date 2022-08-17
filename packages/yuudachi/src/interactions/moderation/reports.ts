import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const ReportLookupCommand = {
	name: 'reports',
	description: 'Look up a report',
	options: [
		{
			name: 'phrase',
			description: 'Term to find a report by (report id, user id, part of user tag, part of reason)',
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			required: true,
		},
		{
			name: 'hide',
			description: 'Hides the output',
			type: ApplicationCommandOptionType.Boolean,
		},
	],
	default_member_permissions: '0',
} as const;
