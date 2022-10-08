import { type APIActionRowComponent, type APIModalActionRowComponent, ComponentType } from "discord-api-types/v10";

export function createModalActionRow(
	components: APIModalActionRowComponent[],
): APIActionRowComponent<APIModalActionRowComponent> {
	return {
		type: ComponentType.ActionRow,
		components,
	} as const;
}
