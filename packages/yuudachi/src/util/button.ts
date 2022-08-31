import {
	type APIButtonComponent,
	ButtonStyle,
	ComponentType,
	type APIButtonComponentBase,
} from 'discord-api-types/v10';

export function createButton({
	label,
	customId,
	style,
	url,
	disabled,
}: {
	customId?: string | undefined;
	disabled?: boolean | undefined;
	label: string;
	style?: ButtonStyle | undefined;
	url?: string | undefined;
}): APIButtonComponent {
	const button: APIButtonComponentBase<any> = {
		type: ComponentType.Button,
		label,
		style: style ?? ButtonStyle.Primary,
		disabled,
	};

	if (style === ButtonStyle.Link && url) {
		return {
			...button,
			url,
		};
	}

	return {
		...button,
		custom_id: customId!,
	};
}
