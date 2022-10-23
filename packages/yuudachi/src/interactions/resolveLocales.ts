import { removeUndefinedKeys } from "@yuudachi/framework";
import type { RESTPostAPIApplicationCommand } from "@yuudachi/framework/types";
import {
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOption,
	type APIApplicationCommandOptionChoice,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	type LocaleString,
	type LocalizationMap,
	ApplicationCommandType,
	ApplicationCommandOptionType,
} from "discord.js";
import i18next from "i18next";

type LocaleObject = {
	description_localizations?: LocalizationMap;
	name_localizations: LocalizationMap;
};

type FetchCommandLocalesOptions = {
	category: string;
	choice?: number | string;
	command: string;
	contextMenu?: boolean;
	option?: string;
	sub_command?: string;
	sub_command_group?: string;
};

function resolveKey(options: FetchCommandLocalesOptions, type?: "description" | "name"): string {
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

function resolveLocalizations(
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

type APIApplicationCommandOptionWithChoices = APIApplicationCommandBasicOption & {
	choices: APIApplicationCommandOptionChoice[];
};

function formatCommandOptionChoicesToLocalizations(
	option: APIApplicationCommandOptionWithChoices,
	extra: FetchCommandLocalesOptions,
): APIApplicationCommandOptionChoice[] {
	return option.choices.map((choice) => ({
		...choice,
		...fetchCommandLocales({
			...extra,
			choice: choice.value,
		}),
	}));
}

type ValidOptionTypes =
	| APIApplicationCommandSubcommandGroupOption
	| APIApplicationCommandSubcommandOption
	| (APIApplicationCommandOption & {
			choices?: APIApplicationCommandOptionChoice[];
	  });

export function formatCommandOptionsToLocalizations(
	option: ValidOptionTypes,
	extra: FetchCommandLocalesOptions,
): Readonly<ValidOptionTypes> {
	if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
		return {
			...option,
			...fetchCommandLocales({ ...extra, sub_command_group: option.name }),
			options:
				option.options?.map((opt) =>
					formatCommandOptionsToLocalizations(opt, { ...extra, sub_command_group: option.name }),
				) ?? [],
		} as APIApplicationCommandSubcommandGroupOption;
	}

	if (option.type === ApplicationCommandOptionType.Subcommand) {
		return {
			...option,
			...fetchCommandLocales({ ...extra, sub_command: option.name }),
			options: option.options
				? option.options.map((opt) => formatCommandOptionsToLocalizations(opt, { ...extra, sub_command: option.name }))
				: undefined,
		} as APIApplicationCommandSubcommandOption;
	}

	return removeUndefinedKeys({
		...option,
		...fetchCommandLocales({
			...extra,
			option: option.name,
		}),
		choices: option.choices?.length
			? formatCommandOptionChoicesToLocalizations(option as APIApplicationCommandOptionWithChoices, {
					...extra,
					option: option.name,
			  })
			: undefined,
	}) as APIApplicationCommandBasicOption;
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
