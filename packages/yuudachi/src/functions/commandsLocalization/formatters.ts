import { removeUndefinedKeys } from "@yuudachi/framework";
import {
	type APIApplicationCommandBasicOption,
	type APIApplicationCommandOptionChoice,
	type APIApplicationCommandSubcommandGroupOption,
	type APIApplicationCommandSubcommandOption,
	ApplicationCommandOptionType,
} from "discord.js";
import { fetchCommandLocales } from "./resolve.js";
import type { APIApplicationCommandOptionWithChoices, FetchCommandLocalesOptions, ValidOptionTypes } from "./types.js";

export function formatCommandOptionChoicesToLocalizations(
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
