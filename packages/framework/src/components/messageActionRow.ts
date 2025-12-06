import { type APIActionRowComponent, type APIComponentInMessageActionRow, ComponentType } from "discord-api-types/v10";

export function createMessageActionRow(
	components: APIComponentInMessageActionRow[],
): APIActionRowComponent<APIComponentInMessageActionRow> {
	return {
		type: ComponentType.ActionRow,
		components,
	} as const;
}
