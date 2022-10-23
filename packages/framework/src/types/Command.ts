import type { APIApplicationCommand } from "discord-api-types/v10";

export type CommandInfo = {
	name: string;
};

export type RESTPostAPIApplicationCommand = Partial<Omit<APIApplicationCommand, "description" | "name">> & {
	description: string;
	name: string;
};
