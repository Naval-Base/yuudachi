import type {
	APIApplicationCommandAutocompleteInteraction,
	APIChatInputApplicationCommandInteraction,
	APIContextMenuInteraction,
	APIMessageComponentButtonInteraction,
	APIMessageComponentSelectMenuInteraction,
	APIModalSubmitInteraction,
	APIPingInteraction,
} from "discord-api-types/v10";

export type APIInteractions =
	| APIApplicationCommandAutocompleteInteraction
	| APIChatInputApplicationCommandInteraction
	| APIContextMenuInteraction
	| APIMessageComponentButtonInteraction
	| APIMessageComponentSelectMenuInteraction
	| APIModalSubmitInteraction
	| APIPingInteraction;
