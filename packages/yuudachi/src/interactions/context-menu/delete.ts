import { ApplicationCommandType } from "discord-api-types/v10";

export const DeleteMessageContextCommand = {
	name: "Delete",
	type: ApplicationCommandType.Message,
	default_member_permissions: "0",
} as const;
