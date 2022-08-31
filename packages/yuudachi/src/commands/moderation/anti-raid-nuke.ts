import i18next from "i18next";
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from "../../Command.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { AntiRaidNukeCommand } from "../../interactions/index.js";
import { file } from "./sub/anti-raid-nuke/file.js";
import { filter } from "./sub/anti-raid-nuke/filter.js";
import { modal } from "./sub/anti-raid-nuke/modal.js";
import { releaseNukeLock } from "./sub/anti-raid-nuke/utils.js";

export default class extends Command<typeof AntiRaidNukeCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof AntiRaidNukeCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const modLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t("common.errors.no_mod_log_channel", { lng: locale }));
		}

		const archiveChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.AntiRaidNukeArchiveChannelId),
		);

		if (!archiveChannel) {
			throw new Error(i18next.t("common.errors.no_anti_raid_archive_channel", { lng: locale }));
		}

		try {
			switch (Object.keys(args)[0]) {
				case "file": {
					await file(interaction, args.file, locale);
					return;
				}

				case "modal": {
					await modal(interaction, args.modal, locale);
					return;
				}

				case "filter": {
					await filter(interaction, args.filter, locale);
					return;
				}

				default:
					break;
			}
		} catch (error_) {
			const error = error_ as Error;
			const keepLockRejection = i18next.t("command.mod.anti_raid_nuke.common.errors.no_concurrent_use", {
				lng: locale,
			});

			if (keepLockRejection !== error.message) {
				await releaseNukeLock(interaction.guildId);
			}

			throw error;
		}
	}
}
