import { Command } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import i18next from "i18next";
import { getCase } from "../../functions/cases/getCase.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { ReferenceCommand } from "../../interactions/index.js";
import { caseReference } from "./sub/reference/case.js";
import { reportReference } from "./sub/reference/report.js";

export default class extends Command<typeof ReferenceCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReferenceCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const caseId = args.case?.case ?? args.report.case;

		const modLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t("common.errors.no_mod_log_channel", { lng: locale }));
		}

		const originalCase = await getCase(interaction.guildId, caseId);

		if (!originalCase) {
			throw new Error(i18next.t("command.mod.common.errors.no_case", { case: caseId, lng: locale }));
		}

		switch (Object.keys(args)[0]) {
			case "case":
				await caseReference(interaction, modLogChannel.id, originalCase, args.case.reference_case, locale);
				break;
			case "report":
				await reportReference(interaction, modLogChannel.id, originalCase, args.report.reference_report, locale);
				break;
			default:
				break;
		}
	}
}
