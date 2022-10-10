import { container, createButton, ellipsis, createMessageActionRow, kRedis, logger } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam } from "@yuudachi/framework/types";
import { ButtonStyle, ComponentType, hyperlink, type Message, type ModalSubmitInteraction } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { nanoid } from "nanoid";
import {
	REPORT_DUPLICATE_EXPIRE_SECONDS,
	REPORT_DUPLICATE_PRE_EXPIRE_SECONDS,
	REPORT_REASON_MAX_LENGTH,
} from "../../../../Constants.js";
import { formatMessageToEmbed } from "../../../../functions/logging/formatMessageToEmbed.js";
import { forwardReport } from "../../../../functions/logging/forwardReport.js";
import { upsertReportLog } from "../../../../functions/logging/upsertReportLog.js";
import { createReport, ReportType } from "../../../../functions/reports/createReport.js";
import { reportRedisMessageKey, reportRedisUserKey } from "../../../../functions/reports/utils.js";
import type { ReportCommand } from "../../../../interactions/index.js";
import { localeTrustAndSafety } from "../../../../util/localizeTrustAndSafety.js";

type MessageReportArgs = Omit<ArgsParam<typeof ReportCommand>["message"], "message_link"> & {
	message: Message;
};

export async function message(
	interaction: InteractionParam | ModalSubmitInteraction<"cached">,
	args: MessageReportArgs,
	locale: string,
) {
	const redis = container.resolve<Redis>(kRedis);
	const messageKey = reportRedisMessageKey(interaction.guildId!, args.message.author.id);
	const userKey = reportRedisUserKey(interaction.guildId!, args.message.author.id);
	const trimmedReason = args.reason.trim();

	const userRecentlyReported = await redis.exists(userKey);

	const reportKey = nanoid();
	const cancelKey = nanoid();

	const reportButton = createButton({
		customId: reportKey,
		label: i18next.t(`command.utility.report.common.buttons.${userRecentlyReported ? "forward" : "execute"}`, {
			lng: locale,
		}),
		style: userRecentlyReported ? ButtonStyle.Primary : ButtonStyle.Danger,
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
		i18next.t(`command.utility.report.message.pending${userRecentlyReported ? "_forward" : ""}`, {
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
		try {
			if ((await redis.smembers(messageKey)).includes(args.message.id)) {
				await collectedInteraction.editReply({
					content: i18next.t("command.utility.report.common.errors.recently_reported.message", { lng: locale }),
					embeds: [],
					components: [],
				});

				return;
			}

			await redis.sadd(messageKey, args.message.id);
			if (userRecentlyReported) {
				try {
					await forwardReport(
						{
							author: collectedInteraction.user,
							reason: trimmedReason,
						},
						args.message as Message<true>,
						locale,
					);
				} catch (error) {
					await collectedInteraction.editReply({
						content: (error as Error).message,
						components: [],
						embeds: [],
					});
					return;
				}
			} else {
				await redis.setex(userKey, REPORT_DUPLICATE_PRE_EXPIRE_SECONDS, "");

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
			}

			await redis
				.multi()
				.sadd(messageKey, args.message.id)
				.expire(messageKey, REPORT_DUPLICATE_EXPIRE_SECONDS)
				.setex(userKey, REPORT_DUPLICATE_EXPIRE_SECONDS, "")
				.exec();

			await collectedInteraction.editReply({
				content: i18next.t(`command.utility.report.message.success${userRecentlyReported ? "_forward" : ""}`, {
					lng: locale,
				}),
				components: [createMessageActionRow([trustAndSafetyButton])],
			});
		} catch {
			void redis.srem(messageKey, args.message.id);
		}
	}
}
