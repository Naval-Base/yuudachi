import { type APIActionRowComponent, type APIMessageActionRowComponent, ComponentType } from "discord-api-types/v10";

export function createMessageActionRow(
	components: APIMessageActionRowComponent[],
): APIActionRowComponent<APIMessageActionRowComponent> {
	return {
		type: ComponentType.ActionRow,
		components,
	} as const;
}
