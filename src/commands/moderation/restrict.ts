import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { RestrictCommand } from '../../interactions';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';

import { mute } from './sub/restrict/mute';
import { embed } from './sub/restrict/embed';
import { react } from './sub/restrict/react';
import { emoji } from './sub/restrict/emoji';
import { unrole } from './sub/restrict/unrole';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof RestrictCommand>,
		locale: string,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild!,
			await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId),
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		switch (Object.keys(args)[0]) {
			case 'mute': {
				return mute(interaction, args.mute, locale);
			}

			case 'embed': {
				return embed(interaction, args.embed, locale);
			}

			case 'react': {
				return react(interaction, args.react, locale);
			}

			case 'emoji': {
				return emoji(interaction, args.emoji, locale);
			}

			case 'unrole': {
				return unrole(interaction, args.unrole, locale);
			}
		}
	}
}
