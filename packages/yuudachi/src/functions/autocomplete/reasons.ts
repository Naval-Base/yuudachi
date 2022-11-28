import type { AutocompleteInteraction } from "discord.js";
import i18next from "i18next";
import { findBestMatch } from "../../util/findBestMatch.js";

export async function handleReasonAutoComplete(interaction: AutocompleteInteraction, locale: string): Promise<void> {
	const input = interaction.options.getFocused().trim();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
	const reasons = i18next.t("command.mod.common.reasons", { returnObjects: true, lng: locale }) as string[];

	const matches = findBestMatch(input, reasons);

	const mappedReasons = matches.map((name) => ({ name, value: name }));

	await interaction.respond(mappedReasons);
}
