import { ButtonStyle, ComponentType, hyperlink, type Message, type ModalSubmitInteraction } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { nanoid } from "nanoid";
import { container } from "tsyringe";
import type { ArgsParam, InteractionParam } from "../../../../Command.js";
import { REPORT_DUPLICATE_EXPIRE_SECONDS, REPORT_REASON_MAX_LENGTH } from "../../../../Constants.js";
import { formatMessageToEmbed } from "../../../../functions/logging/formatMessageToEmbed.js";
import { upsertReportLog } from "../../../../functions/logging/upsertReportLog.js";
import { createReport, ReportType } from "../../../../functions/reports/createReport.js";
import type { ReportCommand } from "../../../../interactions/index.js";
import { logger } from "../../../../logger.js";
import { kRedis } from "../../../../tokens.js";
import { createButton } from "../../../../util/button.js";
import { ellipsis } from "../../../../util/embed.js";
import { localeTrustAndSafety } from "../../../../util/localizeTrustAndSafety.js";
import { createMessageActionRow } from "../../../../util/messageActionRow.js";

type MessageReportArgs = Omit<ArgsParam<typeof ReportCommand>["message"], "message_link"> & {
	message: Message;
};

export async function message(
	interaction: InteractionParam | ModalSubmitInteraction<"cached">,
	args: MessageReportArgs,
	locale: string,
) {
	const redis = container.resolve<Redis>(kRedis);
	const key = `guild:${interaction.guildId}:report:channel:${interaction.channelId!}:message:${args.message.id}`;
	const trimmedReason = args.reason.trim();

	const reportKey = nanoid();
	const cancelKey = nanoid();

	const reportButton = createButton({
		customId: reportKey,
		label: i18next.t("command.utility.report.common.buttons.execute", { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t("command.utility.report.common.buttons.cancel", { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const trustAndSafetyButton = createButton({
		label: i18next.t("command.utility.report.common.buttons.discord_report", { lng: locale }),
		url: localeTrustAndSafety(locale),
		style: ButtonStyle.Link,
	});

	const contentParts = [
		i18next.t("command.utility.report.message.pending", {
			message_link: hyperlink(
				i18next.t("command.utility.report.message.pending_sub", { lng: locale }),
				args.message.url,
			),
			reason: ellipsis(trimmedReason, REPORT_REASON_MAX_LENGTH),
			lng: locale,
		}),
		"",
		i18next.t("command.utility.report.common.warnings", {
			trust_and_safety: hyperlink(
				i18next.t("command.utility.report.common.trust_and_safety_sub", { lng: locale }),
				localeTrustAndSafety(locale),
			),
			lng: locale,
		}),
	];

	const reply = await interaction.editReply({
		content: contentParts.join("\n"),
		embeds: [formatMessageToEmbed(args.message as Message<true>, locale)],
		components: [createMessageActionRow([cancelButton, reportButton, trustAndSafetyButton])],
	});

	const collectedInteraction = await reply
		.awaitMessageComponent({
			componentType: ComponentType.Button,
			filter: (collected) => collected.user.id === interaction.user.id,
			time: 120_000,
		})
		.catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t("command.utility.report.common.errors.timed_out", { lng: locale }),
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
			content: i18next.t("command.utility.report.message.cancel", {
				lng: locale,
			}),
			embeds: [],
			components: [],
		});
	} else if (collectedInteraction?.customId === reportKey) {
		await collectedInteraction.deferUpdate();

		const report = await createReport({
			guildId: interaction.guildId,
			authorId: interaction.user.id,
			authorTag: interaction.user.tag,
			reason: trimmedReason,
			targetId: args.message.author.id,
			targetTag: args.message.author.tag,
			message: args.message,
			type: ReportType.Message,
		});

		await upsertReportLog(interaction.guild, report, args.message);
		await redis.setex(key, REPORT_DUPLICATE_EXPIRE_SECONDS, "");

		await collectedInteraction.editReply({
			content: i18next.t("command.utility.report.message.success", { lng: locale }),
			components: [createMessageActionRow([trustAndSafetyButton])],
		});
	}
}
