import { ComponentType, ModalComponentData, TextInputComponentData, TextInputStyle } from 'discord.js';

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

export function createTextComponent(
	customId: string,
	label: string,
	style?: TextInputStyle,
	maxLength?: number,
	minLength?: number,
	placeholder?: string,
	required?: boolean,
	value?: string,
): TextInputComponentData {
	return {
		type: ComponentType.TextInput,
		customId,
		label,
		style: style ?? TextInputStyle.Paragraph,
		maxLength,
		minLength,
		placeholder,
		required: required ?? false,
		value: value,
	};
}
