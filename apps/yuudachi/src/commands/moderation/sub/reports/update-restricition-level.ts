import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import i18next from "i18next";
import { ReportsRestrictionLevel } from "../../../../Constants.js";
import { checkLogChannel } from "../../../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../../../functions/settings/getGuildSetting.js";
import { updateGuildSetting } from "../../../../functions/settings/updateGuildSetting.js";
import type { ReportUtilsCommand } from "../../../../interactions/index.js";

export async function updateRestrictionLevel(
	interaction: InteractionParam,
	args: ArgsParam<typeof ReportUtilsCommand>["update-restriction-level"],
	locale: LocaleParam,
): Promise<void> {
	const reportLogChannel = checkLogChannel(
		interaction.guild,
		await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId),
	);

	if (!reportLogChannel) {
		throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
	}

	if (args.level !== ReportsRestrictionLevel.Enabled && !args.reason?.length) {
		throw new Error(i18next.t("command.mod.reports.update_restriction_level.errors.no_reason", { lng: locale }));
	}

	const status = await getGuildSetting<ReportsRestrictionLevel>(
		interaction.guildId,
		SettingsKeys.ReportsRestrictionLevel,
	);

	if (status === args.level) {
		throw new Error(i18next.t("command.mod.reports.update_restriction_level.errors.no_change", { lng: locale }));
	}

	const reason = args.level === ReportsRestrictionLevel.Enabled ? null : args.reason;

	await updateGuildSetting(interaction.guildId, SettingsKeys.ReportsRestrictionLevel, args.level);
	await updateGuildSetting(interaction.guildId, SettingsKeys.ReportsRestrictionReason, reason);

	await interaction.editReply({
		content: [
			i18next.t("command.mod.reports.update_restriction_level.base", { lng: locale, level: args.level }),
			i18next.t(`command.mod.reports.update_restriction_level.${args.level}`, { lng: locale, reason }),
		].join("\n"),
	});
}
