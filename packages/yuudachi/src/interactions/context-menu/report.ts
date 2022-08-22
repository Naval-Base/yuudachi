import { ApplicationCommandType } from 'discord-api-types/v10';

export const ReportMessageContextCommand = {
	name: 'Report message',
	type: ApplicationCommandType.Message,
} as const;

export const ReportUserContextCommand = {
	name: 'Report user',
	type: ApplicationCommandType.User,
} as const;
