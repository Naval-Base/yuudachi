import { ApplicationCommandType, type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types';

export const HistoryContextMenuCommand: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
	name: 'History',
	default_permission: false,
	type: ApplicationCommandType.User,
} as const;
