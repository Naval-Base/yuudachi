import type {
	APIModalInteractionResponseCallbackData,
	APIActionRowComponent,
	APITextInputComponent,
} from "discord-api-types/v10";

export function createModal({
	customId,
	title,
	components,
}: {
	components: APIActionRowComponent<APITextInputComponent>[];
	customId: string;
	title: string;
}): APIModalInteractionResponseCallbackData {
	return {
		custom_id: customId,
		title,
		components,
	} as const;
}
