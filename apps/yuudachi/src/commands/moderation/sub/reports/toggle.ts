import { createButton, createMessageActionRow, logger } from "@yuudachi/framework";
import type { InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import type { InteractionResponse } from "discord.js";
import { ButtonStyle, ComponentType } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import { checkLogChannel } from "../../../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../../../functions/settings/getGuildSetting.js";
import { updateGuildSetting } from "../../../../functions/settings/updateGuildSetting.js";

export async function toggle(
	interaction: InteractionParam,
	reply: InteractionResponse<true>,
	locale: LocaleParam,
): Promise<void> {
	const reportLogChannel = checkLogChannel(
		interaction.guild,
		await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId),
	);

	if (!reportLogChannel) {
		throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
	}

	const status = await getGuildSetting<boolean>(interaction.guildId, SettingsKeys.EnableReports);
	const suffix = status ? "disable" : "enable";

	const toggleKey = nanoid();
	const cancelKey = nanoid();

	const toggleButton = createButton({
		label: i18next.t(`command.mod.reports.toggle.buttons.toggle.${suffix}`, { lng: locale }),
		customId: toggleKey,
		style: status ? ButtonStyle.Danger : ButtonStyle.Success,
	});
	const cancelButton = createButton({
		label: i18next.t("command.common.buttons.cancel", { lng: locale }),
		customId: cancelKey,
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t(`command.mod.reports.toggle.pending.${suffix}`, { lng: locale }),
		components: [createMessageActionRow([cancelButton, toggleButton])],
	});

	const collectedInteraction = await reply
		.awaitMessageComponent({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 15_000,
		})
		.catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t("command.common.errors.timed_out", { lng: locale }),
					components: [],
				});
			} catch (error_) {
				const error = error_ as Error;
				logger.error(error, error.message);
			}

			return undefined;
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t(`command.mod.reports.toggle.cancel.${suffix}`, { lng: locale }),
			components: [],
		});
	} else if (collectedInteraction?.customId === toggleKey) {
		await collectedInteraction.deferUpdate();

		await updateGuildSetting(interaction.guildId, SettingsKeys.EnableReports, !status);

		await collectedInteraction.editReply({
			content: i18next.t(`command.mod.reports.toggle.success.${suffix}`, { lng: locale }),
			components: [],
		});
	}
}
