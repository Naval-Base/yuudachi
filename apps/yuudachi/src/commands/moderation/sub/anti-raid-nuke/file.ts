import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { hyperlink } from "discord.js";
import i18next from "i18next";
import { parseFile } from "../../../../functions/anti-raid/parseFile.js";
import type { AntiRaidNukeCommand } from "../../../../interactions/index.js";
import { AntiRaidNukeMode, handleAntiRaidNuke } from "./coreCommand.js";
import { acquireLockIfPublic, validateMemberIds } from "./utils.js";

export async function file(
	interaction: InteractionParam,
	args: ArgsParam<typeof AntiRaidNukeCommand>["file"],
	locale: LocaleParam,
): Promise<void> {
	await acquireLockIfPublic(interaction.guildId, locale, args.hide);

	await interaction.deferReply({ ephemeral: args.hide ?? false });
	const ids = await parseFile(args.file);
	const { validIdCount, totalIdCount, validMembers } = await validateMemberIds(interaction, ids, locale);

	const parameterStrings = [
		i18next.t("command.mod.anti_raid_nuke.common.parameters.parsed_ids", {
			valid: validIdCount,
			total: totalIdCount,
			lng: locale,
		}),
		i18next.t("command.mod.anti_raid_nuke.file.parameters.file", {
			file_link: hyperlink(
				i18next.t("command.mod.anti_raid_nuke.file.parameters.link_label", {
					lng: locale,
				}),
				args.file.url,
			),
			lng: locale,
		}),
	];

	await handleAntiRaidNuke(interaction, validMembers, AntiRaidNukeMode.File, parameterStrings, args, locale);
}
