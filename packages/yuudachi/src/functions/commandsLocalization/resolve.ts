import { removeUndefinedKeys } from "@yuudachi/framework";
import type { RESTPostAPIApplicationCommand } from "@yuudachi/framework/types";
import { ApplicationCommandType } from "discord.js";
import { formatCommandOptionsToLocalizations } from "./formatters.js";
import type { FetchCommandLocalesOptions, LocaleObject } from "./types.js";
import { resolveLocalizations } from "./utils.js";

/**
 * This function allows you to fetch the locales for a command iterating over the internal i18next instance.
 *
 * All options are mapped by name, with exception of choices which are mapped by value.
 *
 * Commons are grouped under the commons top-level, overrides can be done by using the same key on a command.
 */
export function fetchCommandLocales(options: FetchCommandLocalesOptions): LocaleObject {
	// @ts-expect-error: This is callable
	const locales = i18next.options.preload as LocaleString[];
	const { choice, contextMenu } = options;
	const onlyName = contextMenu! || typeof choice === "number" || typeof choice === "string";

	if (onlyName) {
		return {
			name_localizations: resolveLocalizations(options, locales, contextMenu ? "name" : undefined),
		};
	}

	return {
		name_localizations: resolveLocalizations(options, locales, "name"),
		description_localizations: resolveLocalizations(options, locales, "description"),
	};
}

export function formatCommandToLocalizations<T extends RESTPostAPIApplicationCommand>(
	category: string,
	command: Readonly<T>,
): Readonly<LocaleObject & T> {
	return removeUndefinedKeys({
		...command,
		...fetchCommandLocales({
			category,
			command: command.name,
			contextMenu: command.type === ApplicationCommandType.Message || command.type === ApplicationCommandType.User,
		}),
		options: command.options
			? command.options.map((option) =>
					formatCommandOptionsToLocalizations(option, { category, command: command.name }),
			  )
			: undefined,
	});
}
