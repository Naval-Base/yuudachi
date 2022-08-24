import { ms } from '@naval-base/ms';
import { hyperlink, messageLink } from 'discord.js';
import i18next from 'i18next';
import { type ArgsParam, Command, type InteractionParam, type LocaleParam } from '../../Command.js';
import { CaseAction } from '../../functions/cases/createCase.js';
import { getCase } from '../../functions/cases/getCase.js';
import { updateCase } from '../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { DurationCommand } from '../../interactions/index.js';

export default class extends Command<typeof DurationCommand> {
	public override async chatInput(
		interaction: InteractionParam,
		args: ArgsParam<typeof DurationCommand>,
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

		if (originalCase.actionProcessed) {
			const user = await interaction.client.users.fetch(originalCase.targetId);
			throw new Error(
				i18next.t('command.mod.common.errors.already_processed', {
					user: `${user.toString()} - ${user.tag} (${user.id})`,
					case: hyperlink(
						`#${originalCase.caseId}`,
						messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
					),
					lng: locale,
				}),
			);
		}

		const parsedDuration = ms(args.duration);

		if (parsedDuration < 300000 || parsedDuration > 2419200000 || isNaN(parsedDuration)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const actionExpiration = Date.now() + parsedDuration;

		if (originalCase.action === CaseAction.Timeout) {
			try {
				const member = await interaction.guild.members.fetch(originalCase.targetId);
				await member.disableCommunicationUntil(actionExpiration);
			} catch {
				throw new Error(
					i18next.t('command.mod.duration.errors.timeout', {
						case: hyperlink(
							`#${originalCase.caseId}`,
							messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
						),
						lng: locale,
					}),
				);
			}
		}

		const case_ = await updateCase({
			caseId: originalCase.caseId,
			guildId: interaction.guildId,
			actionExpiration: new Date(actionExpiration),
		});
		await upsertCaseLog(interaction.guild, interaction.user, case_);

		await interaction.editReply({
			content: i18next.t('command.mod.duration.success', {
				case: hyperlink(
					`#${originalCase.caseId}`,
					messageLink(modLogChannel.id, originalCase.logMessageId!, interaction.guildId),
				),
				lng: locale,
			}),
		});
	}
}
