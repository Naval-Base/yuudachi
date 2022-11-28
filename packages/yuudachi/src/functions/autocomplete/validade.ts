import type { AutocompleteInteraction } from "discord.js";
import {
	AUTOCOMPLETE_REPORT_FOCUSED_FIELD_NAMES,
	AUTOCOMPLETE_CASE_FOCUSED_FIELD_NAMES,
	AUTOCOMPLETE_REASON_FOCUSED_FIELD_NAME,
} from "../../Constants.js";

export enum AutoCompleteType {
	Case,
	Report,
	Reason,
}

export function findAutocompleteType(interaction: AutocompleteInteraction<"cached">): AutoCompleteType | null {
	if (AUTOCOMPLETE_REPORT_FOCUSED_FIELD_NAMES.includes(interaction.options.getFocused(true).name))
		return AutoCompleteType.Report;

	if (AUTOCOMPLETE_CASE_FOCUSED_FIELD_NAMES.includes(interaction.options.getFocused(true).name))
		return AutoCompleteType.Case;

	if (interaction.options.getFocused(true).name === AUTOCOMPLETE_REASON_FOCUSED_FIELD_NAME)
		return AutoCompleteType.Reason;

	return null;
}
