import { Command } from "@yuudachi/framework";
import type { ArgsParam, CommandMethod, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import i18next from "i18next";
import type { DeleteMessageContextCommand } from "../../interactions/context-menu/delete.js";
import type { RepostMessageContextCommand } from "../../interactions/index.js";

export default class extends Command<typeof DeleteMessageContextCommand> {
	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof RepostMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		if (!args.message.deletable) {
			return void interaction.reply(
				i18next.t("command.common.errors.i_cant", {
					lng: locale,
				}),
			);
		}

		if (interaction.memberPermissions.bitfield < args.message.member!.permissions.bitfield) {
			return void interaction.reply(
				i18next.t("command.common.errors.you_cant", {
					lng: locale,
				}),
			);
		}

		await args.message.delete();
		await interaction.reply({ content: "Deleted.", ephemeral: true });
	}
}
