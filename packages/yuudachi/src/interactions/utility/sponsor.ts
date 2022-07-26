import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export const SponsorCommand = {
	name: 'sponsor',
	description: 'Add sponsor role to a member of this guild',
	options: [
		{
			name: 'user',
			description: 'The user to action',
			type: ApplicationCommandOptionType.User,
			required: true,
		},
	],
	default_member_permissions: '0',
} as const;
