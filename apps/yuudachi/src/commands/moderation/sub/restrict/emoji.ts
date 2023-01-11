import { ms } from "@naval-base/ms";
import { kSQL, createButton, truncateEmbed, createMessageActionRow, container } from "@yuudachi/framework";
import type { InteractionParam, ArgsParam, LocaleParam } from "@yuudachi/framework/types";
import { type Snowflake, ButtonStyle, ComponentType, type InteractionResponse } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import type { Sql } from "postgres";
import { CASE_REASON_MAX_LENGTH } from "../../../../Constants.js";
import { CaseAction, createCase } from "../../../../functions/cases/createCase.js";
import { acquireMemberLock, extendMemberLock, releaseMemberLock } from "../../../../functions/locks/locks.js";
import { generateCasePayload } from "../../../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../../../functions/logging/upsertCaseLog.js";
import type { RestrictCommand } from "../../../../interactions/index.js";
import { generateHistory } from "../../../../util/generateHistory.js";

export async function emoji(
	interaction: InteractionParam,
	reply: InteractionResponse<true>,
	args: ArgsParam<typeof RestrictCommand>["emoji"],
	locale: LocaleParam,
): Promise<void> {
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

	await acquireMemberLock(args.user.member, locale);

	const sql = container.resolve<Sql<any>>(kSQL);

	const [roles] = await sql<[{ emoji_role_id: Snowflake | null }?]>`
		select emoji_role_id
		from guild_settings
		where guild_id = ${interaction.guildId}
	`;

	if (!roles?.emoji_role_id) {
		throw new Error(i18next.t("command.mod.restrict.emoji.errors.no_role", { lng: locale }));
	}

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${args.user.user.id}
			and role_id = ${roles.emoji_role_id}
		order by created_at desc
		limit 1
	`;

	if (action && !action.action_processed) {
		throw new Error(
			i18next.t("command.mod.restrict.emoji.errors.already_restricted", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
		);
	}

	const parsedDuration = ms(args.duration);

	if (parsedDuration < 300_000 || Number.isNaN(parsedDuration)) {
		throw new Error(i18next.t("command.common.errors.duration_format", { lng: locale }));
	}

	const roleKey = nanoid();
	const cancelKey = nanoid();

	const roleButton = createButton({
		label: i18next.t("command.mod.restrict.emoji.buttons.execute", { lng: locale }),
		customId: roleKey,
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		label: i18next.t("command.common.buttons.cancel", { lng: locale }),
		customId: cancelKey,
		style: ButtonStyle.Secondary,
	});

	const embed = truncateEmbed(await generateHistory(interaction, args.user, locale));

	await interaction.editReply({
		content: i18next.t("command.mod.restrict.emoji.pending", {
			user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
			lng: locale,
		}),
		embeds: [embed],
		components: [createMessageActionRow([cancelButton, roleButton])],
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
			} catch {}

			return undefined;
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t("command.mod.restrict.emoji.cancel", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === roleKey) {
		await collectedInteraction.deferUpdate();
		await extendMemberLock(args.user.member);

		const case_ = await createCase(
			collectedInteraction.guild,
			generateCasePayload({
				guildId: collectedInteraction.guildId,
				user: collectedInteraction.user,
				roleId: roles.emoji_role_id,
				args,
				action: CaseAction.Role,
				duration: parsedDuration,
			}),
		);
		await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t("command.mod.restrict.emoji.success", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	}

	await releaseMemberLock(args.user.member);
}
