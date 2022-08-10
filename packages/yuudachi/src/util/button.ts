import { type APIButtonComponent, ButtonStyle, ComponentType } from 'discord-api-types/v10';

export function createButton({
	customId,
	label,
	style,
	disabled,
}: {
	customId: string;
	label: string;
	style?: number | undefined;
	disabled?: boolean | undefined;
}): APIButtonComponent {
	return {
		type: ComponentType.Button,
		custom_id: customId,
		label,
		style: style ?? ButtonStyle.Primary,
		disabled,
	} as const;
}
