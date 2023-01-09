import { basename, extname } from "node:path";
import { logger } from "./logger.js";
import type { ComponentPayload, Runtime } from "./types/ArgumentsOf.js";
import type { ComponentInfo } from "./types/Component.js";
import type {
	ArgsParam,
	ComponentMethod,
	Components,
	InteractionParam,
	InteractionType,
	LocaleParam,
} from "./types/Interaction.js";

export abstract class Component<C extends ComponentPayload = ComponentPayload, R extends Runtime = Runtime.Discordjs>
	implements Components<C, R>
{
	public constructor(public readonly customId?: C["customId"][]) {}

	public button(
		interaction: InteractionParam<ComponentMethod.Button, InteractionType.Component, R>,
		_args: ArgsParam<C, ComponentMethod.Button, InteractionType.Component, R>,
		_locale: LocaleParam<ComponentMethod.Button, InteractionType.Component, R>,
	): Promise<void> | void {
		logger.info(
			{ component: { customId: interaction.customId, type: interaction.type }, userId: interaction.user.id },
			`Received button input for ${interaction.customId}, but the component does not handle button input`,
		);
	}

	public selectMenu(
		interaction: InteractionParam<ComponentMethod.SelectMenu, InteractionType.Component, R>,
		_args: ArgsParam<C, ComponentMethod.Button, InteractionType.Component, R>,
		_locale: LocaleParam<ComponentMethod.SelectMenu, InteractionType.Component, R>,
	): Promise<void> | void {
		logger.info(
			{ component: { customId: interaction.customId, type: interaction.type }, userId: interaction.user.id },
			`Received select menu input for ${interaction.customId}, but the component does not handle select menu input`,
		);
	}

	public modalSubmit(
		interaction: InteractionParam<ComponentMethod.ModalSubmit, InteractionType.Component, R>,
		_args: ArgsParam<C, ComponentMethod.ModalSubmit, InteractionType.Component, R>,
		_locale: LocaleParam<ComponentMethod.ModalSubmit, InteractionType.Component, R>,
	): Promise<void> | void {
		logger.info(
			{ component: { customId: interaction.customId, type: interaction.type }, userId: interaction.user.id },
			`Received modal submit for ${interaction.customId}, but the component does not handle modal submit`,
		);
	}
}

export function componentInfo(path: string): ComponentInfo | null {
	if (extname(path) !== ".js") {
		return null;
	}

	return { customId: basename(path, ".js") } as const;
}
