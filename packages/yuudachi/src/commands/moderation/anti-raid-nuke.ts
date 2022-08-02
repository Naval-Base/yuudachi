import i18next from 'i18next';
import { file } from './sub/anti-raid-nuke/file.js';
import { filter } from './sub/anti-raid-nuke/filter.js';
import { modal } from './sub/anti-raid-nuke/modal.js';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { AntiRaidNukeCommand } from '../../interactions/index.js';

export default class extends Command<typeof AntiRaidNukeCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof AntiRaidNukeCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const modLogChannel = await checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		const archiveChannel = await checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.AntiRaidArchive),
		);

		if (!archiveChannel) {
			throw new Error(i18next.t('common.errors.no_anti_raid_archive_channel', { lng: locale }));
		}

		switch (Object.keys(args)[0]) {
			case 'file': {
				return file(interaction, args.file, locale);
			}

			case 'modal': {
				return modal(interaction, args.modal, locale);
			}

			case 'filter': {
				return filter(interaction, args.filter, locale);
			}

			default:
				break;
		}
	}
}
