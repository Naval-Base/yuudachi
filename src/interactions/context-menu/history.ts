import { ApplicationCommandType, type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/v10';

export const HistoryContextMenuCommand: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
	name: 'History',
	default_permission: false,
	type: ApplicationCommandType.User,
} as const;
