import { injectable } from "@needle-di/core";
import { Command, logger, createButton, truncateEmbed, createMessageActionRow } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import { CASE_REASON_MAX_LENGTH } from "../../Constants.js";
import { CaseAction, createCase } from "../../functions/cases/createCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { WarnCommand } from "../../interactions/index.js";
import { generateHistory } from "../../util/generateHistory.js";

@injectable()
export default class extends Command<typeof WarnCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof WarnCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reply = await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const modLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t("common.errors.no_mod_log_channel", { lng: locale }));
		}

		if (!args.user.member) {
			throw new Error(
				i18next.t("command.common.errors.target_not_found", {
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= CASE_REASON_MAX_LENGTH) {
			throw new Error(
				i18next.t("command.mod.common.errors.max_length_reason", {
					reason_max_length: CASE_REASON_MAX_LENGTH,
					lng: locale,
				}),
			);
		}

		const warnKey = nanoid();
		const cancelKey = nanoid();

		const warnButton = createButton({
			label: i18next.t("command.mod.warn.buttons.execute", { lng: locale }),
			customId: warnKey,
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			label: i18next.t("command.common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		const embed = truncateEmbed(await generateHistory(interaction, args.user, locale));

		await interaction.editReply({
			content: i18next.t("command.mod.warn.pending", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [createMessageActionRow([cancelButton, warnButton])],
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
				} catch (error) {
					const error_ = error as Error;
					logger.error(error_, error_.message);
				}

				return undefined;
			});

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t("command.mod.warn.cancel", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === warnKey) {
			await collectedInteraction.deferUpdate();

			const case_ = await createCase(
				collectedInteraction.guild,
				generateCasePayload({
					guildId: collectedInteraction.guildId,
					user: collectedInteraction.user,
					args,
					action: CaseAction.Warn,
				}),
			);
			await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t("command.mod.warn.success", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
