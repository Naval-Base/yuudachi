import { removeUndefinedKeys } from "@yuudachi/framework";
import type { LocaleString, LocalizationMap } from "discord.js";
import i18next from "i18next";
import type { FetchCommandLocalesOptions } from "./types.js";

export function resolveKey(options: FetchCommandLocalesOptions, type?: "description" | "name"): string {
	const { category, command, choice, option, sub_command, sub_command_group } = options;
	const formattedCommand = command.toLowerCase().replaceAll(" ", "-");
	const isChoice = typeof choice === "number" || typeof choice === "string";

	let key = `commands:${category}.${formattedCommand}`;
	if (sub_command_group) {
		key += `.sub_command_group.${sub_command_group}`;
	}

	if (sub_command) {
		key += `.sub_command.${sub_command}`;
	}

	if (option) {
		key += `.options.${option}`;
	}

	switch (option) {
		case "duration":
		case "hide":
		case "days":
		case "user":
		case "reason":
		case "case_reference":
		case "report_reference":
			// Check for overrides on the commons
			if (i18next.exists(`${key}.${isChoice ? `choices.${choice}` : type}`, { lng: "en-US" })) break;
			key = `commands:commons.options.${option}`;
			break;
		default:
			break;
	}

	if (isChoice) {
		key += `.choices.${choice}`;
	} else {
		key += `.${type}`;
	}

	return key;
}

export function resolveLocalizations(
	options: FetchCommandLocalesOptions,
	locales: LocaleString[],
	type?: "description" | "name",
): LocalizationMap {
	return removeUndefinedKeys(
		locales.reduce<LocalizationMap>((acc, locale) => {
			acc[locale] =
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				i18next.t(resolveKey(options, type), { lng: locale, fallbackLng: "dev", defaultValue: false }) || undefined;
			return acc;
		}, {}),
	);
}
