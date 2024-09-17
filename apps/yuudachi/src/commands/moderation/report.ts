import {
	Command,
	logger,
	kRedis,
	createModal,
	createModalActionRow,
	createTextComponent,
	createButton,
	createMessageActionRow,
} from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import {
	TextInputStyle,
	ComponentType,
	ButtonStyle,
	type MessageContextMenuCommandInteraction,
	type Guild,
	type ModalSubmitInteraction,
	type ChatInputCommandInteraction,
	type GuildMember,
	type User,
	type Message,
	type UserContextMenuCommandInteraction,
} from "discord.js";
import i18next from "i18next";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Redis } from "ioredis";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";
import { REPORT_REASON_MAX_LENGTH, REPORT_REASON_MIN_LENGTH, ReportsRestrictionLevel } from "../../Constants.js";
import type { Report } from "../../functions/reports/createReport.js";
import { getPendingReportByTarget } from "../../functions/reports/getReport.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { ReportCommand, ReportMessageContextCommand, ReportUserContextCommand } from "../../interactions/index.js";
import { parseMessageLink, resolveMessage } from "../../util/resolveMessage.js";
import { message } from "./sub/report/message.js";
import { user } from "./sub/report/user.js";

@injectable()
export default class extends Command<
	typeof ReportCommand | typeof ReportMessageContextCommand | typeof ReportUserContextCommand
> {
	public constructor(@inject(kRedis) public readonly redis: Redis) {
		super(["report", "Report message", "Report user"]);
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReportCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		await this.validateReportChannel(interaction.guild, locale);

		if (Object.keys(args)[0] === "message") {
			const parsedLink = parseMessageLink(args.message.message_link);

			if (!parsedLink) {
				throw new Error(
					i18next.t("command.common.errors.not_message_link", {
						val: args.message.message_link,
						arg: "message_link",
						lng: locale,
					}),
				);
			}

			const { guildId, channelId, messageId } = parsedLink;
			const messageArg = await resolveMessage(interaction.channelId, guildId!, channelId!, messageId!, locale);

			const { pendingReport, restrictionLevel } = await this.validateReport(
				interaction.member,
				messageArg.author,
				locale,
				messageArg,
			);

			const canProceedWithReport = await this.showRestrictedConfirmationIfNecessary(
				interaction,
				restrictionLevel,
				"message",
				locale,
			);

			if (!canProceedWithReport) {
				return;
			}

			await message(
				interaction,
				{
					reason: args.message.reason,
					message: messageArg,
				},
				locale,
				pendingReport,
			);

			return;
		}

		if (!args.user.user.member) {
			throw new Error(i18next.t("command.common.errors.target_not_found", { lng: locale }));
		}

		const { pendingReport, restrictionLevel } = await this.validateReport(
			interaction.member,
			args.user.user.user,
			locale,
		);

		if (pendingReport && !args.user.attachment) {
			throw new Error(i18next.t("command.mod.report.common.errors.no_attachment_forward", { lng: locale }));
		}

		const canProceedWithReport = await this.showRestrictedConfirmationIfNecessary(
			interaction,
			restrictionLevel,
			"user",
			locale,
		);

		if (!canProceedWithReport) {
			return;
		}

		await user(interaction, args.user, locale, pendingReport);
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof ReportUserContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await this.validateReportChannel(interaction.guild, locale);

		const { pendingReport, restrictionLevel } = await this.validateReport(interaction.member, args.user.user, locale);

		if (!args.user.member) {
			throw new Error(i18next.t("command.common.errors.target_not_found", { lng: locale }));
		}

		if (pendingReport) {
			throw new Error(i18next.t("command.mod.report.common.errors.no_attachment_forward", { lng: locale }));
		}

		const handlerResponse = await this.handleContextInteraction(interaction, restrictionLevel, locale);

		if (!handlerResponse) {
			return;
		}

		const { modalInteraction, reason } = handlerResponse;

		await user(
			modalInteraction,
			{
				user: args.user,
				reason,
			},
			locale,
			pendingReport,
		);
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof ReportMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await this.validateReportChannel(interaction.guild, locale);

		const { pendingReport, restrictionLevel } = await this.validateReport(
			interaction.member,
			args.message.author,
			locale,
			args.message,
		);

		const handlerResponse = await this.handleContextInteraction(interaction, restrictionLevel, locale);

		if (!handlerResponse) {
			return;
		}

		const { modalInteraction, reason } = handlerResponse;

		await message(
			modalInteraction,
			{
				message: args.message,
				reason,
			},
			locale,
			pendingReport,
		);
	}

	private async handleContextInteraction(
		interaction: MessageContextMenuCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">,
		restrictionLevel: ReportsRestrictionLevel,
		locale: string,
	): Promise<{
		modalInteraction: ModalSubmitInteraction<"cached">;
		reason: string;
	} | null> {
		const type = interaction.isMessageContextMenuCommand() ? "message" : "user";

		const modalResponse = await this.promptReasonModal(type, interaction, locale);

		if (!modalResponse) {
			return null;
		}

		const { modalInteraction, reason } = modalResponse;

		const canProceedWithReport = await this.showRestrictedConfirmationIfNecessary(
			modalInteraction,
			restrictionLevel,
			type,
			locale,
		);

		if (!canProceedWithReport) {
			return null;
		}

		return {
			modalInteraction,
			reason,
		};
	}

	private async showRestrictedConfirmationIfNecessary(
		interaction: ChatInputCommandInteraction<"cached"> | ModalSubmitInteraction<"cached">,
		restrictionLevel: ReportsRestrictionLevel,
		type: "message" | "user",
		locale: string,
	): Promise<boolean> {
		if (restrictionLevel !== ReportsRestrictionLevel.Restricted) {
			return true;
		}

		const confirmationKey = nanoid();
		const cancelKey = nanoid();

		const confirmationButton = createButton({
			label: i18next.t("command.mod.report.common.buttons.proceed", { lng: locale }),
			customId: confirmationKey,
			style: ButtonStyle.Danger,
		});

		const cancelButton = createButton({
			label: i18next.t("command.common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		const reason = await getGuildSetting<string>(interaction.guildId, SettingsKeys.ReportsRestrictionReason);

		const reply = await interaction.editReply({
			content: i18next.t("command.mod.report.common.restriction", { lng: locale, reason }),
			components: [createMessageActionRow([cancelButton, confirmationButton])],
		});

		const collectedInteraction = await reply
			.awaitMessageComponent({
				filter: (collected) => collected.user.id === interaction.user.id,
				componentType: ComponentType.Button,
				time: 60_000,
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

		if (!collectedInteraction) {
			return false;
		}

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t(`command.mod.report.${type}.cancel`, { lng: locale }),
				components: [],
			});

			return false;
		}

		await collectedInteraction?.deferUpdate();

		return true;
	}

	private async validateReport(
		author: GuildMember,
		target: User,
		locale: string,
		message?: Message<boolean>,
	): Promise<{
		pendingReport: Report | null;
		restrictionLevel: ReportsRestrictionLevel;
	}> {
		if (target.bot) {
			throw new Error(i18next.t("command.mod.report.common.errors.bot", { lng: locale }));
		}

		if (target.id === author.id) {
			throw new Error(i18next.t("command.mod.report.common.errors.no_self", { lng: locale }));
		}

		const restrictionLevel = await getGuildSetting<ReportsRestrictionLevel>(
			author.guild.id,
			SettingsKeys.ReportsRestrictionLevel,
		);

		if (restrictionLevel === ReportsRestrictionLevel.Blocked) {
			const reason = await getGuildSetting<string>(author.guild.id, SettingsKeys.ReportsRestrictionReason);
			throw new Error(i18next.t("command.mod.report.common.errors.disabled", { lng: locale, reason }));
		}

		const userKey = `guild:${author.guild.id}:report:user:${target.id}`;
		const latestReport = await getPendingReportByTarget(author.guild.id, target.id);
		if (latestReport || (await this.redis.exists(userKey))) {
			if (!latestReport || (latestReport.attachmentUrl && !message)) {
				throw new Error(i18next.t("command.mod.report.common.errors.recently_reported.user", { lng: locale }));
			}

			if (message && latestReport?.contextMessagesIds.includes(message.id)) {
				throw new Error(i18next.t("command.mod.report.common.errors.recently_reported.message", { lng: locale }));
			}
		}

		return {
			pendingReport: latestReport,
			restrictionLevel,
		};
	}

	private async validateReportChannel(guild: Guild, locale: string) {
		const reportChannelId = await getGuildSetting(guild.id, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
		}
	}

	private async promptReasonModal(
		type: "message" | "user",
		interaction: MessageContextMenuCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">,
		locale: string,
	): Promise<{
		modalInteraction: ModalSubmitInteraction<"cached">;
		reason: string;
	} | null> {
		const modalKey = nanoid();

		const modal = createModal({
			customId: modalKey,
			title: i18next.t(`command.mod.report.${type}.modal.title`, { lng: locale }),
			components: [
				createModalActionRow([
					createTextComponent({
						customId: "reason",
						label: i18next.t("command.mod.report.common.modal.label", { lng: locale }),
						minLength: REPORT_REASON_MIN_LENGTH,
						maxLength: REPORT_REASON_MAX_LENGTH,
						placeholder: i18next.t("command.mod.report.common.modal.placeholder", { lng: locale }),
						required: true,
						style: TextInputStyle.Paragraph,
					}),
				]),
			],
		});

		await interaction.showModal(modal);

		const modalInteraction = await interaction
			.awaitModalSubmit({
				time: 120_000,
				filter: (component) => component.customId === modalKey,
			})
			.catch(async () => {
				try {
					await interaction.followUp({
						content: i18next.t("command.mod.report.common.errors.timed_out", { lng: locale }),
						ephemeral: true,
						components: [],
					});
				} catch (error_) {
					const error = error_ as Error;
					logger.error(error, error.message);
				}

				return undefined;
			});

		if (!modalInteraction) {
			return null;
		}

		await modalInteraction.deferReply({ ephemeral: true });

		return {
			modalInteraction,
			reason: modalInteraction.components
				.flatMap((row) => row.components)
				.map((component) => (component.type === ComponentType.TextInput ? component.value || "" : ""))
				.join(" "),
		};
	}
}
