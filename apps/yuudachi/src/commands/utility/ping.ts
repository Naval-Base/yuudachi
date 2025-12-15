import { injectable } from "@needle-di/core";
import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { MessageFlags } from "discord.js";
import i18next from "i18next";
import type { PingCommand } from "../../interactions/index.js";

@injectable()
export default class extends Command<typeof PingCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof PingCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ flags: args.hide ? MessageFlags.Ephemeral : undefined });

		await interaction.editReply({
			content: i18next.t("command.utility.ping.success", { lng: locale }),
		});
	}
}
