import type { BaseCommandInteraction } from 'discord.js';
import i18next from 'i18next';
import { embed } from './sub/restrict/embed';
import { emoji } from './sub/restrict/emoji';
import { react } from './sub/restrict/react';
import { unrole } from './sub/restrict/unrole';
import type { Command } from '../../Command';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import type { RestrictCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';

export default class implements Command {
	public async execute(
		interaction: BaseCommandInteraction<'cached'>,
		args: ArgumentsOf<typeof RestrictCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		switch (Object.keys(args)[0]) {
			case 'embed': {
				return embed(interaction, reply, args.embed, locale);
			}

			case 'react': {
				return react(interaction, reply, args.react, locale);
			}

			case 'emoji': {
				return emoji(interaction, reply, args.emoji, locale);
			}

			case 'unrole': {
				return unrole(interaction, reply, args.unrole, locale);
			}
		}
	}
}
