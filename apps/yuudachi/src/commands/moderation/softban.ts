import { inject, injectable } from "@needle-di/core";
import { Command, logger, kRedis, createButton, truncateEmbed, createMessageActionRow } from "@yuudachi/framework";
import type { ArgsParam, InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { ButtonStyle, ComponentType, MessageFlags } from "discord.js";
import i18next from "i18next";
import type { Redis } from "ioredis";
import { nanoid } from "nanoid";
import { CASE_REASON_MAX_LENGTH } from "../../Constants.js";
import { CaseAction, createCase } from "../../functions/cases/createCase.js";
import { generateCasePayload } from "../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../functions/settings/getGuildSetting.js";
import type { SoftbanCommand } from "../../interactions/index.js";
import { generateHistory } from "../../util/generateHistory.js";
import { tryAcquireMemberLock, extendMemberLock } from "../../util/memberLock.js";

@injectable()
export default class extends Command<typeof SoftbanCommand> {
	public constructor(public readonly redis: Redis = inject(kRedis)) {
		super();
	}

	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof SoftbanCommand>,
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

		let alreadyBanned = false;
		try {
			await interaction.guild.bans.fetch(args.user.user.id);
			alreadyBanned = true;
		} catch {}

		if (alreadyBanned) {
			throw new Error(
				i18next.t("command.mod.softban.errors.already_banned", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.user.member && !args.user.member.bannable) {
			throw new Error(
				i18next.t("command.mod.softban.errors.missing_permissions", {
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

		const isStillMember = interaction.guild.members.resolve(args.user.user.id);

		const softbanKey = nanoid();
		const cancelKey = nanoid();

		const softbanButton = createButton({
			label: i18next.t("command.mod.softban.buttons.execute", { lng: locale }),
			customId: softbanKey,
			style: ButtonStyle.Danger,
		});
		const cancelButton = createButton({
			label: i18next.t("command.common.buttons.cancel", { lng: locale }),
			customId: cancelKey,
			style: ButtonStyle.Secondary,
		});

		const embed = truncateEmbed(await generateHistory(interaction, args.user, locale));

		await interaction.editReply({
			content: i18next.t(isStillMember ? "command.mod.softban.pending" : "command.mod.softban.not_member", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [createMessageActionRow([cancelButton, softbanButton])],
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
				content: i18next.t("command.mod.softban.cancel", {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === softbanKey) {
			await collectedInteraction.deferUpdate();

			await extendMemberLock(interaction.guildId, args.user.user.id);

			let alreadyBannedNow = false;
			try {
				await collectedInteraction.guild.bans.fetch(args.user.user.id);
				alreadyBannedNow = true;
			} catch {}

			if (alreadyBannedNow) {
				await collectedInteraction.editReply({
					content: i18next.t("command.mod.softban.errors.already_banned", {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
				return;
			}

			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:ban`, 15, "");
			await this.redis.setex(`guild:${collectedInteraction.guildId}:user:${args.user.user.id}:unban`, 15, "");

			if (isStillMember) {
				const case_ = await createCase(
					collectedInteraction.guild,
					generateCasePayload({
						guildId: collectedInteraction.guildId,
						user: collectedInteraction.user,
						args: {
							...args,
							days: Math.min(Math.max(Number(args.days ?? 1), 0), 7),
						},
						action: CaseAction.Softban,
					}),
				);
				await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);
			} else {
				const reason = i18next.t("command.mod.softban.reasons.clear_messages", {
					user: collectedInteraction.user.tag,
					lng: locale,
				});

				await interaction.guild.bans.create(args.user.user, {
					reason,
					deleteMessageDays: Math.min(Math.max(Number(args.days ?? 1), 0), 7),
				});
				await interaction.guild.bans.remove(args.user.user, reason);
			}

			await collectedInteraction.editReply({
				content: i18next.t(
					isStillMember ? "command.mod.softban.success.regular" : "command.mod.softban.success.clear_messages",
					{
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					},
				),
				components: [],
			});
		}
	}
}
