import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

import type { RestrictCommand } from '../../../../interactions';
import type { ArgumentsOf } from '../../../../interactions/ArgumentsOf';
import { logger } from '../../../../logger';
import { kSQL } from '../../../../tokens';
import { deleteCase } from '../../../../util/deleteCase';

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
			throw new Error(i18next.t('command.mod.restrict.unrole.errors.already_processed', { lng: locale }));
		}

		await deleteCase(interaction, args.case);

		await interaction.editReply({
			content: i18next.t('command.mod.restrict.unrole.success', {
				case: args.case,
				lng: locale,
			}),
		});
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
