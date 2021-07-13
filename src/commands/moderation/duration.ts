import type { CommandInteraction } from 'discord.js';
import i18next from 'i18next';
import { ms } from '@naval-base/ms';

import type { ArgumentsOf } from '../../interactions/ArgumentsOf';
import type { Command } from '../../Command';
import type { DurationCommand } from '../../interactions';
import { checkModRole } from '../../util/checkModRole';
import { updateCase } from '../../util/updateCase';
import { upsertCaseLog } from '../../util/upsertCaseLog';
import { logger } from '../../logger';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction,
		args: ArgumentsOf<typeof DurationCommand>,
		locale: string,
	): Promise<void> {
		await interaction.defer({ ephemeral: true });
		await checkModRole(interaction, locale);

		const parsedDuration = ms(args.duration);
		if (parsedDuration < 300000 || isNaN(parsedDuration)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		try {
			const case_ = await updateCase({
				caseId: args.case,
				guildId: interaction.guildId!,
				actionExpiration: new Date(Date.now() + parsedDuration),
			});
			await upsertCaseLog(interaction, case_);

			await interaction.editReply({
				content: i18next.t('command.mod.duration.success', { case: args.case, lng: locale }),
			});
		} catch (e) {
			logger.error(e);
			throw new Error(i18next.t('command.mod.duration.errors.failure', { case: args.case, lng: locale }));
		}
	}
}
