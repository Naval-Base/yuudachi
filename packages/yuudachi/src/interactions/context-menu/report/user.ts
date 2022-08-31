import { ApplicationCommandType } from "discord.js";

export const ReportUserContextCommand = {
	name: "Report user",
	type: ApplicationCommandType.User,
} as const;
