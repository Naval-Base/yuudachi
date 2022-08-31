import { ButtonStyle, ComponentType, hyperlink, messageLink, type InteractionResponse } from "discord.js";
import i18next from "i18next";
import { nanoid } from "nanoid";
import type { InteractionParam, ArgsParam, LocaleParam } from "../../../../Command.js";
import { deleteCase } from "../../../../functions/cases/deleteCase.js";
import { getCase } from "../../../../functions/cases/getCase.js";
import { upsertCaseLog } from "../../../../functions/logging/upsertCaseLog.js";
import { checkLogChannel } from "../../../../functions/settings/checkLogChannel.js";
import { getGuildSetting, SettingsKeys } from "../../../../functions/settings/getGuildSetting.js";
import type { RestrictCommand } from "../../../../interactions/index.js";
import { createButton } from "../../../../util/button.js";
import { createMessageActionRow } from "../../../../util/messageActionRow.js";

export async function unrole(
	interaction: InteractionParam,
	reply: InteractionResponse<true>,
	args: ArgsParam<typeof RestrictCommand>["unrole"],
	locale: LocaleParam,
): Promise<void> {
	const modLogChannel = checkLogChannel(
		interaction.guild,
		await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
	);

	if (!modLogChannel) {
		throw new Error(i18next.t("common.errors.no_mod_log_channel", { lng: locale }));
	}

	const originalCase = await getCase(interaction.guildId, args.case);
	if (!originalCase) {
		throw new Error(i18next.t("command.mod.common.errors.no_case", { case: args.case, lng: locale }));
	}

	if (originalCase.actionProcessed) {
		const user = await interaction.client.users.fetch(originalCase.targetId);
		throw new Error(
			i18next.t("command.mod.common.errors.already_processed", {
				user: `${user.toString()} - ${user.tag} (${user.id})`,
				case: hyperlink(
					`#${originalCase.caseId}`,
					messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
				),
				lng: locale,
			}),
		);
	}

	const user = await interaction.client.users.fetch(originalCase.targetId);
	let role = null;
	try {
		role = await interaction.guild.roles.fetch(originalCase.roleId!, { force: true });
	} catch {}

	const unroleKey = nanoid();
	const cancelKey = nanoid();

	const roleButton = createButton({
		label: i18next.t("command.mod.restrict.unrole.buttons.execute", { lng: locale }),
		customId: unroleKey,
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		label: i18next.t("command.common.buttons.cancel", { lng: locale }),
		customId: cancelKey,
		style: ButtonStyle.Secondary,
	});

	await interaction.editReply({
		content: i18next.t("command.mod.restrict.unrole.pending", {
			user: `${user.toString()} - ${user.tag} (${user.id})`,
			role: role ? `${role.toString()} - ${role.name} (${role.id})` : "Unknown",
			case: hyperlink(
				`#${originalCase.caseId}`,
				messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
			),
			lng: locale,
		}),
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
			content: i18next.t("command.mod.restrict.unrole.cancel", {
				user: `${user.toString()} - ${user.tag} (${user.id})`,
				role: role ? `${role.toString()} - ${role.name} (${role.id})` : "Unknown",
				case: hyperlink(
					`#${originalCase.caseId}`,
					messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
				),
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === unroleKey) {
		await collectedInteraction.deferUpdate();

		const case_ = await deleteCase({
			guild: collectedInteraction.guild,
			user: collectedInteraction.user,
			caseId: args.case,
			manual: true,
		});
		await upsertCaseLog(collectedInteraction.guild, collectedInteraction.user, case_);

		await collectedInteraction.editReply({
			content: i18next.t("command.mod.restrict.unrole.success", {
				user: `${user.toString()} - ${user.tag} (${user.id})`,
				role: role ? `${role.toString()} - ${role.name} (${role.id})` : "Unknown",
				case: hyperlink(
					`#${originalCase.caseId}`,
					messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
				),
				lng: locale,
			}),
			components: [],
		});
	}
}
