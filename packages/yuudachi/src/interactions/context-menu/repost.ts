import { ApplicationCommandType } from "discord-api-types/v10";

export const RepostMessageContextCommand = {
	name: "Repost",
	type: ApplicationCommandType.Message,
	default_member_permissions: "0",
} as const;
