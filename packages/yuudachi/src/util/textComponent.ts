import { type APITextInputComponent, TextInputStyle, ComponentType } from 'discord-api-types/v10';

export function createTextComponent({
	customId,
	label,
	style,
	maxLength,
	minLength,
	placeholder,
	required,
	value,
}: {
	customId: string;
	label: string;
	style?: TextInputStyle;
	maxLength?: number;
	minLength?: number;
	placeholder?: string;
	required?: boolean;
	value?: string;
}): APITextInputComponent {
	return {
		type: ComponentType.TextInput,
		custom_id: customId,
		label,
		style: style ?? TextInputStyle.Paragraph,
		max_length: maxLength,
		min_length: minLength,
		placeholder,
		required: required ?? false,
		value,
	};
}
