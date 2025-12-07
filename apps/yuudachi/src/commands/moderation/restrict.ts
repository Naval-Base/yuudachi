import { injectable } from "@needle-di/core";
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import i18next from "i18next";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { RestrictCommand } from "../../interactions/index.js";
import { embed } from "./sub/restrict/embed.js";
import { emoji } from "./sub/restrict/emoji.js";
import { react } from "./sub/restrict/react.js";
import { unrole } from "./sub/restrict/unrole.js";

@injectable()
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
			throw new Error(i18next.t("common.errors.no_mod_log_channel", { lng: locale }));
		}

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (Object.keys(args)[0]) {
			case "embed": {
				await embed(interaction, reply, args.embed, locale);
				break;
			}

			case "react": {
				await react(interaction, reply, args.react, locale);
				break;
			}

			case "emoji": {
				await emoji(interaction, reply, args.emoji, locale);
				break;
			}

			case "unrole": {
				await unrole(interaction, reply, args.unrole, locale);
				break;
			}

			default:
				break;
		}
	}
}
