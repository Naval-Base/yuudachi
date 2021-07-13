import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { container } from 'tsyringe';
import type { Sql } from 'postgres';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { UnbanCommand } from '../../interactions';
import { CaseAction, createCase } from '../../functions/cases/createCase';
import { generateHistory } from '../../util/generateHistory';
import { upsertCaseLog } from '../../functions/logs/upsertCaseLog';
import { generateCasePayload } from '../../functions/logs/generateCasePayload';
import { checkModRole } from '../../functions/permissions/checkModRole';
import { kSQL } from '../../tokens';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof UnbanCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		try {
			await interaction.guild?.bans.fetch(args.user.user.id);
		} catch {
			throw new Error(
				i18next.t('command.mod.unban.errors.no_ban', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}

		if (args.reason && args.reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const sql = container.resolve<Sql<any>>(kSQL);

		try {
			const unbanKey = nanoid();
			const cancelKey = nanoid();

			const embed = await generateHistory(interaction, args.user);

			const unbanButton = new MessageButton()
				.setCustomId(unbanKey)
				.setLabel(i18next.t('command.mod.unban.buttons.execute', { lng: locale }))
				.setStyle('DANGER');
			const cancelButton = new MessageButton()
				.setCustomId(cancelKey)
				.setLabel(i18next.t('command.mod.unban.buttons.cancel', { lng: locale }))
				.setStyle('SECONDARY');

			await interaction.editReply({
				content: i18next.t('command.mod.unban.pending', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
				// @ts-expect-error
				embeds: [embed],
				components: [new MessageActionRow().addComponents([cancelButton, unbanButton])],
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
					content: i18next.t('command.mod.unban.cancel', {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
			} else if (collectedInteraction?.customId === unbanKey) {
				await collectedInteraction.deferUpdate();

				const [refCase] = await sql<[{ case_id: number }?]>`
					select case_id
					from cases
					where guild_id = ${collectedInteraction.guildId}
						and target_id = ${args.user.user.id}
						and action = ${CaseAction.Ban}
					order by created_at desc
					limit 1`;

				const case_ = await createCase(
					collectedInteraction,
					generateCasePayload(
						collectedInteraction,
						{ ...args, reference: args.reference ?? (refCase?.case_id ? Number(refCase.case_id) : undefined) },
						CaseAction.Unban,
					),
				);
				void upsertCaseLog(collectedInteraction, case_);

				await collectedInteraction.editReply({
					content: i18next.t('command.mod.unban.success', {
						user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
						lng: locale,
					}),
					components: [],
				});
			}
		} catch (e) {
			logger.error(e);
			throw new Error(
				i18next.t('command.mod.unban.errors.failure', {
					user: `${args.user.user.toString()} - ${args.user.user.tag} (${args.user.user.id})`,
					lng: locale,
				}),
			);
		}
	}
}
