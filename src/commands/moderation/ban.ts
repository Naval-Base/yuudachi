import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { BanCommand } from '../../interactions';
import { CaseAction, createCase } from '../../util/createCase';
import { generateHistory } from '../../util/generateHistory';
import { upsertCaseLog } from '../../util/upsertCaseLog';
import { generateCasePayload } from '../../util/generateCasePayload';
import { checkModRole } from '../../util/checkModRole';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof BanCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		await interaction.guild?.bans
			.fetch(args.user.user.id)
			.then(() => {
				throw new Error(
					i18next.t('command.mod.ban.errors.already_banned', {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
				);
			})
			.catch(() => null);

		if (args.user.member && !args.user.member.bannable) {
			throw new Error(
				i18next.t('command.mod.ban.errors.missing_permissions', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		try {
			const banKey = nanoid();
			const cancelKey = nanoid();

			const embed = await generateHistory(interaction, args.user);

			const banButton = new MessageButton()
				.setCustomId(banKey)
				.setLabel(i18next.t('command.mod.ban.buttons.execute', { lng: locale }))
				.setStyle('DANGER');
			const cancelButton = new MessageButton()
				.setCustomId(cancelKey)
				.setLabel(i18next.t('command.mod.ban.buttons.cancel', { lng: locale }))
				.setStyle('SECONDARY');

			await interaction.editReply({
				content: i18next.t('command.mod.ban.pending', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				// @ts-expect-error
				embeds: [embed],
				components: [new MessageActionRow().addComponents([cancelButton, banButton])],
			});

			const collectedInteraction = await interaction.channel
				?.awaitMessageComponent<ButtonInteraction>({
					filter: (collected) => collected.user.id === interaction.user.id,
					componentType: 'BUTTON',
					time: 15000,
				})
				.catch(async () => {
					try {
						await interaction.editReply({
							content: i18next.t('command.common.errors.timed_out', { lng: locale }),
							components: [],
						});
					} catch {}
				});

			if (collectedInteraction?.customId === cancelKey) {
				await collectedInteraction.update({
					content: i18next.t('command.mod.ban.cancel', {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
			} else if (collectedInteraction?.customId === banKey) {
				await collectedInteraction.deferUpdate();

				const case_ = await createCase(
					collectedInteraction,
					generateCasePayload(collectedInteraction, args, CaseAction.Ban),
				);
				void upsertCaseLog(collectedInteraction, case_);

				await collectedInteraction.editReply({
					content: i18next.t('command.mod.ban.success', {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
			}
		} catch (e) {
			logger.error(e);
			throw new Error(
				i18next.t('command.mod.ban.errors.failure', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}
	}
}
