import { logger, createModal, createModalActionRow, createTextComponent } from "@yuudachi/framework";
import type { InteractionParam, ArgsParam, LocaleParam } from "@yuudachi/framework/types";
import { ComponentType, MessageFlags } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import type { AntiRaidNukeCommand } from "../../../../interactions/index.js";
import { AntiRaidNukeMode, handleAntiRaidNuke } from "./coreCommand.js";
import { acquireLockIfPublic, validateMemberIds } from "./utils.js";

export async function modal(
	interaction: InteractionParam,
	args: ArgsParam<typeof AntiRaidNukeCommand>["modal"],
	locale: LocaleParam,
): Promise<void> {
	await acquireLockIfPublic(interaction.guildId, locale, args.hide);
	const modalKey = nanoid();

	const textComponents = Array.from({ length: 5 })
		.fill(0)
		.map((_, index) =>
			createTextComponent({
				customId: `${modalKey}-${index}`,
				label: i18next.t("command.mod.anti_raid_nuke.modal.components.label", { idx: index + 1, lng: locale }),
				minLength: 17,
				placeholder: i18next.t("command.mod.anti_raid_nuke.modal.components.placeholder", { lng: locale }),
				required: index === 0,
			}),
		);

	await interaction.showModal(
		createModal({
			customId: modalKey,
			title: i18next.t("command.mod.anti_raid_nuke.modal.title", { lng: locale }),
			components: textComponents.map((textComponent) => createModalActionRow([textComponent])),
		}),
	);

	const modalInteraction = await interaction
		.awaitModalSubmit({
			time: 120_000,
			filter: (component) => component.customId === modalKey,
		})
		.catch(async () => {
			try {
				await interaction.followUp({
					content: i18next.t("command.common.errors.timed_out", { lng: locale }),
					flags: MessageFlags.Ephemeral,
					components: [],
				});
			} catch (error) {
				const error_ = error as Error;
				logger.error(error_, error_.message);
			}

			return undefined;
		});

	if (!modalInteraction) {
		return;
	}

	await modalInteraction.deferReply({ flags: args.hide ? MessageFlags.Ephemeral : undefined });
	const fullContent = modalInteraction.components
		.flatMap((row) => (row.type === ComponentType.ActionRow ? row.components : []))
		.map((component) => (component.type === ComponentType.TextInput ? component.value || "" : ""));

	const ids = new Set(fullContent.join(" ").match(/\d{17,20}/g) ?? []);
	const { validIdCount, totalIdCount, validMembers } = await validateMemberIds(modalInteraction, ids, locale);

	const parameterStrings = [
		i18next.t("command.mod.anti_raid_nuke.common.parameters.parsed_ids", {
			valid: validIdCount,
			total: totalIdCount,
			lng: locale,
		}),
	];

	await handleAntiRaidNuke(modalInteraction, validMembers, AntiRaidNukeMode.Modal, parameterStrings, args, locale);
}
