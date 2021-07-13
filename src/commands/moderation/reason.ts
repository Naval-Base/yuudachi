import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { ReasonCommand } from '../../interactions';
import { checkModRole } from '../../util/checkModRole';
import { updateCase } from '../../util/updateCase';
import { upsertCaseLog } from '../../util/upsertCaseLog';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof ReasonCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		if (args.reason.length >= 1900) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		try {
			const case_ = await updateCase({
				caseId: args.case,
				guildId: interaction.guildId!,
				reason: args.reason,
			});
			await upsertCaseLog(interaction, case_);

			await interaction.editReply({
				content: i18next.t('command.mod.reason.success', { case: args.case, lng: locale }),
			});
		} catch (e) {
			logger.error(e);
			throw new Error(i18next.t('command.mod.reason.errors.failure', { case: args.case, lng: locale }));
		}
	}
}
