import { ApplicationCommandType } from "discord-api-types/v10";

export const ClearContextCommand = {
	name: "Clear messages to",
	type: ApplicationCommandType.Message,
	default_member_permissions: "0",
} as const;
