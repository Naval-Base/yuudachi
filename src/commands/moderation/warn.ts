import {
	type CommandInteraction,
	type ButtonInteraction,
	ActionRow,
	ButtonComponent,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Command } from '../../Command';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { checkLogChannel } from '../../functions/settings/checkLogChannel';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting';
import type { WarnCommand } from '../../interactions';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import { logger } from '../../logger';
import { awaitComponent } from '../../util/awaitComponent';
import { generateHistory } from '../../util/generateHistory';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof WarnCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
		await checkModRole(interaction, locale);

		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (args.reason && args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const warnKey = nanoid();
		const cancelKey = nanoid();

		const embed = await generateHistory(interaction, args.user, locale);

		const warnButton = new ButtonComponent()
			.setCustomId(warnKey)
			.setLabel(i18next.t('command.mod.warn.buttons.execute', { lng: locale }))
			.setStyle(ButtonStyle.Danger);
		const cancelButton = new ButtonComponent()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.warn.buttons.cancel', { lng: locale }))
			.setStyle(ButtonStyle.Secondary);

		await interaction.editReply({
			content: i18next.t('command.mod.warn.pending', {
				user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
				lng: locale,
			}),
			embeds: [embed],
			components: [new ActionRow().addComponents(cancelButton, warnButton)],
		});

		const collectedInteraction = (await awaitComponent(interaction.client, reply, {
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 15000,
		}).catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		})) as ButtonInteraction<'cached'> | undefined;

		if (collectedInteraction?.customId === cancelKey) {
			await collectedInteraction.update({
				content: i18next.t('command.mod.warn.cancel', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === warnKey) {
			await collectedInteraction.deferUpdate();

			const case_ = await createCase(
				collectedInteraction.guild,
				generateCasePayload({
					guildId: collectedInteraction.guildId,
					user: collectedInteraction.user,
					args,
					action: CaseAction.Warn,
				}),
			);
			await upsertCaseLog(collectedInteraction.guildId, collectedInteraction.user, case_);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.warn.success', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				components: [],
			});
		}
	}
}
