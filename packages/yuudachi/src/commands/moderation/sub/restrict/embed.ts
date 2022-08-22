import { ms } from "@naval-base/ms";
import { type Snowflake, ButtonStyle, ComponentType, type InteractionResponse } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import type { Sql } from "postgres";
import { container } from "tsyringe";
import type { InteractionParam, ArgsParam, LocaleParam } from "../../../../Command.js";
import { CaseAction, createCase } from "../../../../functions/cases/createCase.js";
import { generateCasePayload } from "../../../../functions/logging/generateCasePayload.js";
import { upsertCaseLog } from "../../../../functions/logging/upsertCaseLog.js";
import type { RestrictCommand } from "../../../../interactions/index.js";
import { kSQL } from "../../../../tokens.js";
import { createButton } from "../../../../util/button.js";
import { generateHistory } from "../../../../util/generateHistory.js";
import { createMessageActionRow } from "../../../../util/messageActionRow.js";

export async function embed(
	interaction: InteractionParam,
	reply: InteractionResponse<true>,
	args: ArgsParam<typeof RestrictCommand>["embed"],
	locale: LocaleParam,
): Promise<void> {
	if (!args.user.member) {
		throw new Error(
			i18next.t("command.common.errors.target_not_found", {
				lng: locale,
			}),
		);
	}

	if (args.reason && args.reason.length >= 500) {
		throw new Error(i18next.t("command.mod.common.errors.max_length_reason", { lng: locale }));
	}

	const sql = container.resolve<Sql<any>>(kSQL);

	const [roles] = await sql<[{ embed_role_id: Snowflake | null }?]>`
		select embed_role_id
		from guild_settings
		where guild_id = ${interaction.guildId}
	`;

	if (!roles?.embed_role_id) {
		throw new Error(i18next.t("command.mod.restrict.embed.errors.no_role", { lng: locale }));
	}

	const [action] = await sql<[{ action_processed: boolean }?]>`
		select action_processed
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${args.user.user.id}
			and role_id = ${roles.embed_role_id}
		order by created_at desc
		limit 1
	`;

	if (action && !action.action_processed) {
		throw new Error(
			i18next.t("command.mod.restrict.embed.errors.already_restricted", {
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
		label: i18next.t("command.mod.restrict.embed.buttons.execute", { lng: locale }),
		customId: roleKey,
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		label: i18next.t("command.common.buttons.cancel", { lng: locale }),
		customId: cancelKey,
		style: ButtonStyle.Secondary,
	});

	const embed = await generateHistory(interaction, args.user, locale);

	await interaction.editReply({
		content: i18next.t("command.mod.restrict.embed.pending", {
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
			content: i18next.t("command.mod.restrict.embed.cancel", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === roleKey) {
		await collectedInteraction.deferUpdate();

		const case_ = await createCase(
			collectedInteraction.guild,
			generateCasePayload({
				guildId: collectedInteraction.guildId,
				user: collectedInteraction.user,
				roleId: roles.embed_role_id,
				args,
				action: CaseAction.Role,
				duration: parsedDuration,
			}),
		);
		await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t("command.mod.restrict.embed.success", {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			components: [],
		});
	}
}
