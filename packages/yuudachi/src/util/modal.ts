import { ComponentType, ModalComponentData, TextInputComponentData } from 'discord.js';

export function createModal(
	title: string,
	customId: string,
	componentsData: TextInputComponentData[],
): ModalComponentData {
	return {
		title,
		customId,
		components: componentsData.map((c) => ({
			type: ComponentType.ActionRow,
			components: [c],
		})),
	};
}
