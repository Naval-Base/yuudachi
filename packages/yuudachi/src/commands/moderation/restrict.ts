import i18next from 'i18next';
import { embed } from './sub/restrict/embed.js';
import { emoji } from './sub/restrict/emoji.js';
import { react } from './sub/restrict/react.js';
import { unrole } from './sub/restrict/unrole.js';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { RestrictCommand } from '../../interactions/index.js';

export default class extends Command<typeof RestrictCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof RestrictCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const modLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
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

			default:
				break;
		}
	}
}
