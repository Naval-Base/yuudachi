import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { nanoid } from 'nanoid';

import type { RestrictCommand } from '../../../../interactions';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf';
import { logger } from '../../../../logger';
import { kSQL } from '../../../../tokens';
import { deleteCase } from '../../../../functions/cases/deleteCase';

export async function unrole(
	interaction: CommandInteraction,
	args: ArgumentsOf<typeof RestrictCommand>['unrole'],
	locale: string,
): Promise<void> {
	const sql = container.resolve<Sql<any>>(kSQL);

	try {
		const [action] = await sql<[{ action_processed: boolean }?]>`
			select action_processed
			from cases
			where guild_id = ${interaction.guildId}
				and case_id = ${args.case}`;

		if (action?.action_processed) {
			throw new Error(
				i18next.t('command.mod.restrict.unrole.errors.already_processed', { case: args.case, lng: locale }),
			);
		}

		const unroleKey = nanoid();
		const cancelKey = nanoid();

		const roleButton = new MessageButton()
			.setCustomId(unroleKey)
			.setLabel(i18next.t('command.mod.restrict.unrole.buttons.execute', { lng: locale }))
			.setStyle('DANGER');
		const cancelButton = new MessageButton()
			.setCustomId(cancelKey)
			.setLabel(i18next.t('command.mod.restrict.unrole.buttons.cancel', { lng: locale }))
			.setStyle('SECONDARY');

		await interaction.editReply({
			content: i18next.t('command.mod.restrict.unrole.pending', {
				case: args.case,
				lng: locale,
			}),
			components: [new MessageActionRow().addComponents([cancelButton, roleButton])],
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
				content: i18next.t('command.mod.restrict.unrole.cancel', {
					case: args.case,
					lng: locale,
				}),
				components: [],
			});
		} else if (collectedInteraction?.customId === unroleKey) {
			await collectedInteraction.deferUpdate();

			await deleteCase(interaction, args.case);

			await collectedInteraction.editReply({
				content: i18next.t('command.mod.restrict.unrole.success', {
					case: args.case,
					lng: locale,
				}),
				components: [],
			});
		}
	} catch (e) {
		logger.error(e);
		throw new Error(
			i18next.t('command.mod.restrict.unrole.errors.failure', {
				case: args.case,
				lng: locale,
			}),
		);
	}
}
