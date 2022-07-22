import type { CommandInteraction, GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { inject, injectable } from 'tsyringe';
import { file } from './sub/anti-raid-nuke/file.js';
import { manual } from './sub/anti-raid-nuke/manual.js';
import { modal } from './sub/anti-raid-nuke/modal.js';
import type { Command } from '../../Command.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { AntiRaidNukeCommand } from '../../interactions/index.js';
import { kRedis } from '../../tokens.js';

export interface AntiRaidResult {
	member: GuildMember;
	success: boolean;
	caseId?: number;
	error?: string;
}

@injectable()
export default class implements Command {
	public constructor(@inject(kRedis) public readonly redis: Redis) {}

	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof AntiRaidNukeCommand>,
		locale: string,
	): Promise<void> {
		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		const archiveChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.GeneralLogChannelId)) as string,
		);
		if (!archiveChannel) {
			throw new Error(i18next.t('common.errors.no_general_log_channel', { lng: locale }));
		}

		const modRoleId = (await getGuildSetting(interaction.guildId, SettingsKeys.ModRoleId)) as string;

		switch (Object.keys(args)[0]) {
			case 'file': {
				return file(interaction, args.file, logChannel, modRoleId, locale, this.redis);
			}

			case 'modal': {
				return modal(interaction, args.modal, logChannel, modRoleId, locale, this.redis);
			}

			case 'manual': {
				return manual(interaction, args.manual, logChannel, modRoleId, locale, this.redis);
			}

			default:
				break;
		}
	}
}
