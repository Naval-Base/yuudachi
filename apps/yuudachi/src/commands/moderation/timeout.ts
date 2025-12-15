import { ms } from "@naval-base/ms";
import { inject, injectable } from "@needle-di/core";
import { Command, logger, kRedis, createButton, truncateEmbed, createMessageActionRow } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { ButtonStyle, ComponentType, MessageFlags, PermissionFlagsBits } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { nanoid } from "nanoid";
import { CASE_REASON_MAX_LENGTH } from "../../Constants.js";
import { CaseAction, createCase } from "../../functions/cases/createCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { TimeoutCommand } from "../../interactions/moderation/timeout.js";
import { generateHistory } from "../../util/generateHistory.js";
import { tryAcquireMemberLock, extendMemberLock } from "../../util/memberLock.js";

@injectable()
export default class extends Command<typeof TimeoutCommand> {
	public constructor(public readonly redis: Redis = inject(kRedis)) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof TimeoutCommand>,
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
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (Date.now() < (args.user.member.communicationDisabledUntilTimestamp ?? 0)) {
			throw new Error(
				i18next.t("command.mod.timeout.errors.already_timed_out", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (
			!args.user.member.moderatable ||
			!interaction.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)
		) {
			throw new Error(
				i18next.t("command.mod.timeout.errors.missing_permissions", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
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

		const lockAcquired = await tryAcquireMemberLock(interaction.guildId, args.user.user.id);
		if (!lockAcquired) {
			throw new Error(
				i18next.t("command.mod.common.errors.already_processing", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		const timeoutKey = nanoid();
		const cancelKey = nanoid();

		const timeoutButton = createButton({
			label: i18next.t("command.mod.timeout.buttons.execute", { lng: locale }),
			customId: timeoutKey,
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			label: i18next.t("command.common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		const embed = truncateEmbed(await generateHistory(interaction, args.user, locale));

		await interaction.editReply({
			content: i18next.t("command.mod.timeout.pending", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [createMessageActionRow([cancelButton, timeoutButton])],
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
				content: i18next.t("command.mod.timeout.cancel", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === timeoutKey) {
			await collectedInteraction.deferUpdate();

			await extendMemberLock(interaction.guildId, args.user.user.id);

			const memberNow = collectedInteraction.guild.members.resolve(args.user.user.id);
			if (!memberNow) {
				await collectedInteraction.editReply({
					content: i18next.t("command.common.errors.target_not_found", {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
				return;
			}

			if (Date.now() < (memberNow.communicationDisabledUntilTimestamp ?? 0)) {
				await collectedInteraction.editReply({
					content: i18next.t("command.mod.timeout.errors.already_timed_out", {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
				return;
			}

			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:timeout`, 15, "");
			const case_ = await createCase(
				collectedInteraction.guild,
				generateCasePayload({
					guildId: collectedInteraction.guildId,
					user: collectedInteraction.user,
					args,
					duration: ms(args.duration),
					action: CaseAction.Timeout,
				}),
			);
			await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t("command.mod.timeout.success", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
