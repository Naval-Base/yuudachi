import type { APIApplicationCommand, ApplicationCommandType } from "discord-api-types/v10";

export type CommandInfo = {
	name: string;
};

export type RESTPostAPIApplicationCommand = Partial<
	Omit<APIApplicationCommand, "application_id" | "description" | "guild_id" | "id" | "name" | "type" | "version">
> & {
	description: string;
	name: string;
	type: ApplicationCommandType;
};
