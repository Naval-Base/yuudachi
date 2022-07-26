import { ApplicationCommandType, type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/v10';

export const HistoryContextMenuCommand: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
	name: 'History',
	default_member_permissions: '0',
	type: ApplicationCommandType.User,
} as const;
