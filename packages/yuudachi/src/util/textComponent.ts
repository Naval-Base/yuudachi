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
	maxLength?: number | undefined;
	minLength?: number | undefined;
	placeholder?: string | undefined;
	required?: boolean | undefined;
	style?: TextInputStyle | undefined;
	value?: string | undefined;
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
	} as const;
}
