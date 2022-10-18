import { Command, logger, kRedis, createModal, createModalActionRow, createTextComponent } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam, CommandMethod } from "@yuudachi/framework/types";
import { type GuildMember, type User, type Message, TextInputStyle, ComponentType } from "discord.js";
import i18next from "i18next";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { Redis } from "ioredis";
import { nanoid } from "nanoid";
import { inject, injectable } from "tsyringe";
import { REPORT_REASON_MAX_LENGTH, REPORT_REASON_MIN_LENGTH } from "../../Constants.js";
import type { Report } from "../../functions/reports/createReport.js";
import { getPendingReportsByTarget } from "../../functions/reports/getReport.js";
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

		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
		}

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

			const pendingReport = await this.validateReport(interaction.member, messageArg.author, locale, messageArg);

			await message(
				interaction,
				{
					reason: args.message.reason,
					message: messageArg,
				},
				locale,
				pendingReport,
			);
		} else {
			if (!args.user.user.member) {
				throw new Error(i18next.t("command.common.errors.target_not_found", { lng: locale }));
			}

			await this.validateReport(interaction.member, args.user.user.user, locale);

			await user(interaction, args.user, locale);
		}
	}

	public override async userContext(
		interaction: InteractionParam<CommandMethod.UserContext>,
		args: ArgsParam<typeof ReportUserContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
		}

		const modalKey = nanoid();

		if (!args.user.member) {
			throw new Error(i18next.t("command.common.errors.target_not_found", { lng: locale }));
		}

		await this.validateReport(interaction.member, args.user.user, locale);

		const modal = createModal({
			customId: modalKey,
			title: i18next.t("command.utility.report.user.modal.title", { lng: locale }),
			components: [
				createModalActionRow([
					createTextComponent({
						customId: "reason",
						label: i18next.t("command.utility.report.common.modal.label", { lng: locale }),
						minLength: REPORT_REASON_MIN_LENGTH,
						maxLength: REPORT_REASON_MAX_LENGTH,
						placeholder: i18next.t("command.utility.report.common.modal.placeholder", { lng: locale }),
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
						content: i18next.t("command.utility.report.common.errors.timed_out", { lng: locale }),
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
			return;
		}

		await modalInteraction.deferReply({ ephemeral: true });

		const reason = modalInteraction.components
			.flatMap((row) => row.components)
			.map((component) => (component.type === ComponentType.TextInput ? component.value || "" : ""));

		await user(
			modalInteraction,
			{
				user: args.user,
				reason: reason.join(" "),
			},
			locale,
		);
	}

	public override async messageContext(
		interaction: InteractionParam<CommandMethod.MessageContext>,
		args: ArgsParam<typeof ReportMessageContextCommand>,
		locale: LocaleParam,
	): Promise<void> {
		const reportChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ReportChannelId);
		const reportChannel = checkLogChannel(interaction.guild, reportChannelId);
		if (!reportChannel) {
			throw new Error(i18next.t("common.errors.no_report_channel", { lng: locale }));
		}

		const modalKey = nanoid();

		const pendingReport = await this.validateReport(interaction.member, args.message.author, locale, args.message);

		const modal = createModal({
			customId: modalKey,
			title: i18next.t("command.utility.report.message.modal.title", { lng: locale }),
			components: [
				createModalActionRow([
					createTextComponent({
						customId: "reason",
						label: i18next.t("command.utility.report.common.modal.label", { lng: locale }),
						minLength: REPORT_REASON_MIN_LENGTH,
						maxLength: REPORT_REASON_MAX_LENGTH,
						placeholder: i18next.t("command.utility.report.common.modal.placeholder", { lng: locale }),
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
						content: i18next.t("command.utility.report.common.errors.timed_out", { lng: locale }),
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
			return;
		}

		await modalInteraction.deferReply({ ephemeral: true });

		const reason = modalInteraction.components
			.flatMap((row) => row.components)
			.map((component) => (component.type === ComponentType.TextInput ? component.value || "" : ""));

		await message(
			modalInteraction,
			{
				message: args.message,
				reason: reason.join(" "),
			},
			locale,
			pendingReport,
		);
	}

	private async validateReport(
		author: GuildMember,
		target: User,
		locale: string,
		message?: Message<boolean>,
	): Promise<Report | undefined> {
		if (target.bot) {
			throw new Error(i18next.t("command.utility.report.common.errors.bot", { lng: locale }));
		}

		if (target.id === author.id) {
			throw new Error(i18next.t("command.utility.report.common.errors.no_self", { lng: locale }));
		}

		const userKey = `guild:${author.guild.id}:report:user:${target.id}`;
		const [latestReport] = await getPendingReportsByTarget(author.guild.id, target.id);
		if ((await this.redis.exists(userKey)) || latestReport) {
			if (!message || !latestReport) {
				throw new Error(i18next.t("command.utility.report.common.errors.recently_reported.user", { lng: locale }));
			}

			if (latestReport?.contextMessagesIds.includes(message.id)) {
				throw new Error(i18next.t("command.utility.report.common.errors.recently_reported.message", { lng: locale }));
			}
		}

		return latestReport;
	}
}
