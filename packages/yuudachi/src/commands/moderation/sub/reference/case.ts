import { hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import type { InteractionParam } from '../../../../Command.js';
import type { Case } from '../../../../functions/cases/createCase.js';
import { getCase } from '../../../../functions/cases/getCase.js';
import { updateCase } from '../../../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../../../functions/logging/upsertCaseLog.js';

export async function caseReference(
	interaction: InteractionParam,
	logChannelId: string,
	originalCase: Case,
	caseId: number,
	locale: string,
) {
	const referenceCase = await getCase(interaction.guildId, caseId);

	if (!referenceCase) {
		throw new Error(
			i18next.t('command.mod.common.errors.no_reference_case', {
				case: caseId,
				lng: locale,
			}),
		);
	}

	const case_ = await updateCase({
		caseId: originalCase.caseId,
		guildId: interaction.guildId,
		caseReferenceId: referenceCase.caseId,
	});
	await upsertCaseLog(interaction.guild, interaction.user, case_);

	await interaction.editReply({
		content: i18next.t('command.mod.reference.case', {
			case: hyperlink(
				`\`#${originalCase.caseId}\``,
				messageLink(logChannelId, originalCase.logMessageId!, interaction.guildId),
			),
			ref: hyperlink(
				`\`#${referenceCase.caseId}\``,
				messageLink(logChannelId, referenceCase.logMessageId!, interaction.guildId),
			),
			lng: locale,
		}),
	});
}
