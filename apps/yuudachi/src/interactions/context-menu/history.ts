import { ApplicationCommandType } from "discord-api-types/v10";

export const HistoryUserContextCommand = {
	name: "History",
	type: ApplicationCommandType.User,
	default_member_permissions: "0",
} as const;
