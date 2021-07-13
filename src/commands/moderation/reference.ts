import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { ReferenceCommand } from '../../interactions';
import { checkModRole } from '../../util/checkModRole';
import { updateCase } from '../../util/updateCase';
import { upsertCaseLog } from '../../util/upsertCaseLog';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof ReferenceCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		try {
			const case_ = await updateCase({
				caseId: args.case,
				guildId: interaction.guildId!,
				referenceId: args.reference,
			});
			await upsertCaseLog(interaction, case_);

			await interaction.editReply({
				content: i18next.t('command.mod.reference.success', { case: args.case, ref: args.reference, lng: locale }),
			});
		} catch (e) {
			logger.error(e);
			throw new Error(
				i18next.t('command.mod.reference.errors.failure', { case: args.case, ref: args.reference, lng: locale }),
			);
		}
	}
}
