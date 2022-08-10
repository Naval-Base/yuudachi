import { hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { getCase } from '../../functions/cases/getCase.js';
import { updateCase } from '../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ReferenceCommand } from '../../interactions/index.js';

export default class extends Command<typeof ReferenceCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof ReferenceCommand>,
		locale: LocaleParam,
	): Promise<void> {
		await interaction.deferReply({ ephemeral: true });

		const modLogChannel = checkLogChannel(
			interaction.guild,
			await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId),
		);

		if (!modLogChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		const originalCase = await getCase(interaction.guildId, args.case);

		if (!originalCase) {
			throw new Error(i18next.t('command.mod.common.errors.no_case', { case: args.case, lng: locale }));
		}

		const referenceCase = await getCase(interaction.guildId, args.reference);

		if (!referenceCase) {
			throw new Error(
				i18next.t('command.mod.common.errors.no_reference_case', {
					case: args.reference,
					lng: locale,
				}),
			);
		}

		const case_ = await updateCase({
			caseId: originalCase.caseId,
			guildId: interaction.guildId,
			referenceId: referenceCase.caseId,
		});
		await upsertCaseLog(interaction.guild, interaction.user, case_);

		await interaction.editReply({
			content: i18next.t('command.mod.reference.success', {
				case: hyperlink(
					`#${originalCase.caseId}`,
					messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
				),
				ref: hyperlink(
					`#${referenceCase.caseId}`,
					messageLink(modLogChannel.id, referenceCase.logMessageId!, interaction.guildId),
				),
				lng: locale,
			}),
		});
	}
}
