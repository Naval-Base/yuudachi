import { ApplicationCommandType } from 'discord-api-types/v10';

export const HistoryContextMenuCommand = {
	name: 'History',
	type: ApplicationCommandType.User,
	default_member_permissions: '0',
} as const;
