import { ApplicationCommandType, type RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/v10';

export const ClearContentContextMenuCommand: RESTPostAPIContextMenuApplicationCommandsJSONBody = {
	name: 'Clear message content',
	default_member_permissions: '0',
	type: ApplicationCommandType.Message,
} as const;
