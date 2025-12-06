import { type APIActionRowComponent, type APITextInputComponent, ComponentType } from "discord-api-types/v10";

export function createModalActionRow(
	components: APITextInputComponent[],
): APIActionRowComponent<APITextInputComponent> {
	return {
		type: ComponentType.ActionRow,
		components,
	} as const;
}
