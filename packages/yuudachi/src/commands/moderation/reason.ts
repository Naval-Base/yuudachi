import { ComponentType, ButtonStyle, hyperlink, messageLink } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from "../../Command.js";
import { CASE_REASON_MAX_LENGTH } from "../../Constants.js";
import type { Case } from "../../functions/cases/createCase.js";
import { getCase } from "../../functions/cases/getCase.js";
import { updateCase } from "../../functions/cases/updateCase.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { ReasonCommand } from "../../interactions/index.js";
import { logger } from "../../logger.js";
import { createButton } from "../../util/button.js";
import { truncate } from "../../util/embed.js";
import { createMessageActionRow } from "../../util/messageActionRow.js";

export default class extends Command<typeof ReasonCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReasonCommand>,
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

		if (args.reason && args.reason.length >= CASE_REASON_MAX_LENGTH) {
			throw new Error(
				i18next.t("command.mod.common.errors.max_length_reason", {
					reason_max_length: CASE_REASON_MAX_LENGTH,
					lng: locale,
				}),
			);
		}

		const lower = Math.min(args.case, args.last_case ?? args.case);
		const upper = Math.max(args.case, args.last_case ?? args.case);

		if (lower < 1 || upper < 1) {
			await interaction.editReply({
				content: i18next.t("command.mod.common.errors.case_lower_one", {
					lng: locale,
				}),
			});
			return;
		}

		let originalCaseLower: Case | null;
		let originalCaseUpper: Case | null;

		if (args.last_case) {
			const changeKey = nanoid();
			const cancelKey = nanoid();

			const changeButton = createButton({
				label: i18next.t("command.mod.reason.buttons.execute", { lng: locale }),
				customId: changeKey,
				style: ButtonStyle.Danger,
			});
			const cancelButton = createButton({
				label: i18next.t("command.common.buttons.cancel", { lng: locale }),
				customId: cancelKey,
				style: ButtonStyle.Secondary,
			});

			originalCaseLower = await getCase(interaction.guildId, lower);
			originalCaseUpper = await getCase(interaction.guildId, upper);

			if (!originalCaseLower || !originalCaseUpper) {
				await interaction.editReply({
					content: i18next.t("command.mod.common.errors.no_case_range", {
						lower_case: lower,
						upper_case: upper,
						lng: locale,
					}),
					components: [],
				});
				return;
			}

			await interaction.editReply({
				content: i18next.t("command.mod.reason.pending_multiple", {
					lower_case: hyperlink(
						`#${lower}`,
						messageLink(modLogChannel.id, originalCaseLower.logMessageId!, interaction.guildId),
					),
					upper_case: hyperlink(
						`#${upper}`,
						messageLink(modLogChannel.id, originalCaseUpper.logMessageId!, interaction.guildId),
					),
					count: upper - lower + 1,
					lng: locale,
				}),
				components: [createMessageActionRow([cancelButton, changeButton])],
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

			if (
				collectedInteraction &&
				(collectedInteraction.customId === cancelKey || collectedInteraction.customId !== changeKey)
			) {
				await collectedInteraction.update({
					content: i18next.t("command.mod.reason.cancel", {
						lng: locale,
					}),
					components: [],
				});
				return;
			} else if (!collectedInteraction) {
				return;
			}
		} else {
			originalCaseLower = await getCase(interaction.guildId, lower);

			if (!originalCaseLower) {
				await interaction.editReply({
					content: i18next.t("command.mod.common.errors.no_case", {
						case: lower,
						lng: locale,
					}),
					components: [],
				});
				return;
			}
		}

		const success: number[] = [];

		for (let caseId = lower; caseId <= upper; caseId++) {
			const originalCase = await getCase(interaction.guildId, caseId);

			if (!originalCase) {
				continue;
			}

			const case_ = await updateCase({
				caseId: originalCase.caseId,
				guildId: interaction.guildId,
				reason: args.reason,
			});

			await upsertCaseLog(interaction.guild, interaction.user, case_);
			success.push(caseId);
		}

		const message = args.last_case
			? i18next.t("command.mod.reason.success_multiple", {
					lower_case: hyperlink(
						`#${lower}`,
						messageLink(modLogChannel.id, originalCaseLower.logMessageId!, interaction.guildId),
					),
					upper_case: hyperlink(
						`#${upper}`,
						messageLink(modLogChannel.id, originalCaseUpper!.logMessageId!, interaction.guildId),
					),
					amount: success.length,
					count: upper - lower + 1,
					lng: locale,
			  })
			: i18next.t("command.mod.reason.success", {
					case: hyperlink(
						`#${lower}`,
						messageLink(modLogChannel.id, originalCaseLower.logMessageId!, interaction.guildId),
					),
					lng: locale,
			  });

		await interaction.editReply({
			content: truncate(message, 1_000, ""),
			components: [],
		});
	}
}
