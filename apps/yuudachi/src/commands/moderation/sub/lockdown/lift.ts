import { createButton, createMessageActionRow } from "@yuudachi/framework";
import type { InteractionParam, LocaleParam } from "@yuudachi/framework/types";
import { type TextChannel, ButtonStyle, ComponentType, type InteractionResponse } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import { deleteLockdown } from "../../../../functions/lockdowns/deleteLockdown.js";
import { getLockdown } from "../../../../functions/lockdowns/getLockdown.js";

export async function lift(
	interaction: InteractionParam,
	reply: InteractionResponse<true>,
	channel: TextChannel,
	locale: LocaleParam,
): Promise<void> {
	const lockdown = await getLockdown(interaction.guildId, channel.id);

	if (!lockdown) {
		throw new Error(
			i18next.t("command.mod.lockdown.lift.errors.not_locked", {
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
		);
	}

	const unlockKey = nanoid();
	const cancelKey = nanoid();

	const unlockButton = createButton({
		label: i18next.t("command.mod.lockdown.lift.buttons.execute", { lng: locale }),
		customId: unlockKey,
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		label: i18next.t("command.common.buttons.cancel", { lng: locale }),
		customId: cancelKey,
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t("command.mod.lockdown.lift.pending", {
			channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
			lng: locale,
		}),
		components: [createMessageActionRow([cancelButton, unlockButton])],
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
			content: i18next.t("command.mod.lockdown.lift.cancel", {
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === unlockKey) {
		await collectedInteraction.deferUpdate();

		const lockdown = await deleteLockdown(channel.id);

		if (!lockdown) {
			throw new Error(
				i18next.t("command.mod.lockdown.lift.errors.failure", {
					channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
					lng: locale,
				}),
			);
		}

		await collectedInteraction.editReply({
			content: i18next.t("command.mod.lockdown.lift.success", {
				channel: `${channel.toString()} - ${channel.name} (${channel.id})`,
				lng: locale,
			}),
			components: [],
		});
	}
}
