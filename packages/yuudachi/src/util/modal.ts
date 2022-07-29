import type {
	APIModalInteractionResponseCallbackData,
	APIActionRowComponent,
	APIModalActionRowComponent,
} from 'discord-api-types/v10';

export function createModal({
	customId,
	title,
	components,
}: {
	customId: string;
	title: string;
	components: APIActionRowComponent<APIModalActionRowComponent>[];
}): APIModalInteractionResponseCallbackData {
	return {
		custom_id: customId,
		title,
		components,
	};
}
