import { hyperlink } from 'discord.js';
import i18next from 'i18next';
import { AntiRaidNukeMode, handleAntiRaidNuke, validateMemberIds } from './coreCommand.js';
import type { ArgsParam, InteractionParam, LocaleParam } from '../../../../Command.js';
import { parseFile } from '../../../../functions/anti-raid/parseFile.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';

export async function file(
	interaction: InteractionParam,
	args: ArgsParam<typeof AntiRaidNukeCommand>['file'],
	locale: LocaleParam,
): Promise<void> {
	await interaction.deferReply({ ephemeral: args.hide ?? true });
	const ids = await parseFile(args.file);
	const { validIdCount, totalIdCount, validMembers } = await validateMemberIds(
		interaction,
		ids,
		i18next.t('command.mod.anti_raid_nuke.file.errors.no_ids', { lng: locale }),
	);

	const parameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.common.parameters.parsed_ids', {
			valid: validIdCount,
			total: totalIdCount,
			lng: locale,
		}),
		i18next.t('command.mod.anti_raid_nuke.file.parameters.file', {
			file_link: hyperlink(
				i18next.t('command.mod.anti_raid_nuke.file.parameters.link_label', {
					lng: locale,
				}),
				args.file.url,
			),
			lng: locale,
		}),
	];

	await handleAntiRaidNuke(interaction, validMembers, AntiRaidNukeMode.Modal, parameterStrings, args, locale);
}
