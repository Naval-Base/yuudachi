import type { AutocompleteInteraction } from 'discord.js';
import i18next from 'i18next';
import { AUTOCOMPLETE_REASON_FOCUSED_FIELD_NAME } from '../../Constants.js';

export function checkReasonAutocomplete(interaction: AutocompleteInteraction) {
	return interaction.options.getFocused(true).name === AUTOCOMPLETE_REASON_FOCUSED_FIELD_NAME;
}

export async function handleAutocompleteReasons(interaction: AutocompleteInteraction, locale: string): Promise<void> {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const reasons = i18next.t('command.mod.common.reasons', { returnObjects: true, lng: locale }) as string[];

	const mappedReasons = reasons.map((name) => ({ name, value: name }));

	await interaction.respond(mappedReasons);
}
