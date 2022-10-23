import type {
	APIApplicationCommandBasicOption,
	APIApplicationCommandOptionChoice,
	APIApplicationCommandSubcommandGroupOption,
	APIApplicationCommandSubcommandOption,
	LocalizationMap,
} from "discord.js";

export type ValidOptionTypes =
	| APIApplicationCommandSubcommandGroupOption
	| APIApplicationCommandSubcommandOption
	| (APIApplicationCommandBasicOption & {
			choices?: APIApplicationCommandOptionChoice[];
	  });

export type APIApplicationCommandOptionWithChoices = APIApplicationCommandBasicOption & {
	choices: APIApplicationCommandOptionChoice[];
};

export type LocaleObject = {
	description_localizations?: LocalizationMap;
	name_localizations: LocalizationMap;
};

export type FetchCommandLocalesOptions = {
	category: string;
	choice?: number | string;
	command: string;
	contextMenu?: boolean;
	option?: string;
	sub_command?: string;
	sub_command_group?: string;
};
