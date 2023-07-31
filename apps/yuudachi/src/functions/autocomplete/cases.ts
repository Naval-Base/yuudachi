import {
	AUTOCOMPLETE_CHOICE_LIMIT,
	AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
	ellipsis,
	logger,
} from "@yuudachi/framework";
import type { LocaleParam } from "@yuudachi/framework/types";
import { Collection } from "discord.js";
import type { Snowflake, AutocompleteInteraction } from "discord.js";
import i18next from "i18next";
import { OP_DELIMITER } from "../../Constants.js";
import { caseActionLabel } from "../../util/actionKeys.js";
import type { CaseAction } from "../cases/createCase.js";
import { findCases } from "../cases/findCases.js";

export async function handleCaseAutocomplete(
	interaction: AutocompleteInteraction<"cached">,
	locale: LocaleParam,
	allowHistory = false,
) {
	try {
		const trimmedPhrase = interaction.options.getFocused().trim();
		const cases = await findCases(trimmedPhrase, interaction.guildId);
		let choices = cases.map((case_) => {
			const choiceName = `#${case_.case_id} ${caseActionLabel(case_.action as CaseAction, locale).toUpperCase()} ${
				case_.target_tag
			}: ${
				case_.reason ??
				i18next.t("command.mod.case.autocomplete.no_reason", {
					lng: locale,
				})!
			}`;

			return {
				name: ellipsis(choiceName, AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT),
				value: String(case_.case_id),
			} as const;
		});

		const uniqueTargets = new Collection<string, { id: Snowflake; tag: string }>();

		for (const case_ of cases) {
			if (uniqueTargets.has(case_.target_id)) {
				continue;
			}

			uniqueTargets.set(case_.target_id, { id: case_.target_id, tag: case_.target_tag });
		}

		if (uniqueTargets.size === 1 && allowHistory) {
			const target = uniqueTargets.first()!;
			choices = [
				{
					name: ellipsis(
						i18next.t("command.mod.case.autocomplete.show_history", {
							user: target.tag,
							lng: locale,
						})!,
						AUTOCOMPLETE_CHOICE_NAME_LENGTH_LIMIT,
					),
					value: `history${OP_DELIMITER}${target.id}`,
				},
				...choices,
			];

			if (choices.length > AUTOCOMPLETE_CHOICE_LIMIT) {
				choices.length = AUTOCOMPLETE_CHOICE_LIMIT;
			}
		}

		await interaction.respond(choices.slice(0, 25));
	} catch (error_) {
		const error = error_ as Error;
		logger.error(error, error.message);
	}
}
