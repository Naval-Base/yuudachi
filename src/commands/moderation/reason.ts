import { type CommandInteraction, Formatters, ComponentType, ButtonStyle } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { Command } from '../../Command.js';
import type { Case } from '../../functions/cases/createCase.js';
import { getCase } from '../../functions/cases/getCase.js';
import { updateCase } from '../../functions/cases/updateCase.js';
import { upsertCaseLog } from '../../functions/logging/upsertCaseLog.js';
import { checkLogChannel } from '../../functions/settings/checkLogChannel.js';
import { getGuildSetting, SettingsKeys } from '../../functions/settings/getGuildSetting.js';
import type { ArgumentsOf } from '../../interactions/ArgumentsOf.js';
import type { ReasonCommand } from '../../interactions/index.js';
import { logger } from '../../logger.js';
import { createButton } from '../../util/button.js';
import { truncate } from '../../util/embed.js';
import { generateMessageLink } from '../../util/generateMessageLink.js';
import { createMessageActionRow } from '../../util/messageActionRow.js';

export default class implements Command {
	public async execute(
		interaction: CommandInteraction<'cached'>,
		args: ArgumentsOf<typeof ReasonCommand>,
		locale: string,
	): Promise<void> {
		const reply = await interaction.deferReply({ ephemeral: true });

		const logChannel = await checkLogChannel(
			interaction.guild,
			(await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId)) as string,
		);
		if (!logChannel) {
			throw new Error(i18next.t('common.errors.no_mod_log_channel', { lng: locale }));
		}

		if (args.reason.length >= 500) {
			throw new Error(i18next.t('command.mod.common.errors.max_length_reason', { lng: locale }));
		}

		const lower = Math.min(args.case, args.lastcase ?? args.case);
		const upper = Math.max(args.case, args.lastcase ?? args.case);

		if (lower < 1 || upper < 1) {
			await interaction.editReply({
				content: i18next.t('command.mod.common.errors.case_lower_one', {
					lng: locale,
				}),
			});
			return;
		}

		let originalCaseLower: Case | null;
		let originalCaseUpper: Case | null;

		if (args.lastcase) {
			const changeKey = nanoid();
			const cancelKey = nanoid();

			const changeButton = createButton({
				customId: changeKey,
				label: i18next.t('command.mod.reason.buttons.execute', { lng: locale }),
				style: ButtonStyle.Danger,
			});
			const cancelButton = createButton({
				customId: cancelKey,
				label: i18next.t('command.mod.reason.buttons.cancel', { lng: locale }),
				style: ButtonStyle.Secondary,
			});

			originalCaseLower = await getCase(interaction.guildId, lower);
			originalCaseUpper = await getCase(interaction.guildId, upper);

			if (!originalCaseLower || !originalCaseUpper) {
				await interaction.editReply({
					content: i18next.t('command.mod.common.errors.no_case_range', {
						lower_case: lower,
						upper_case: upper,
						lng: locale,
					}),
					components: [],
				});
				return;
			}

			await interaction.editReply({
				content: i18next.t('command.mod.reason.pending_multiple', {
					lower_case: Formatters.hyperlink(
						`#${lower}`,
						generateMessageLink(interaction.guildId, logChannel.id, originalCaseLower.logMessageId!),
					),
					upper_case: Formatters.hyperlink(
						`#${upper}`,
						generateMessageLink(interaction.guildId, logChannel.id, originalCaseUpper.logMessageId!),
					),
					amount: upper - lower + 1,
					lng: locale,
				}),
				components: [createMessageActionRow([cancelButton, changeButton])],
			});

			const collectedInteraction = await reply
				.awaitMessageComponent({
					filter: (collected) => collected.user.id === interaction.user.id,
					componentType: ComponentType.Button,
					time: 15000,
				})
				.catch(async () => {
					try {
						await interaction.editReply({
							content: i18next.t('common.errors.timed_out', { lng: locale }),
							components: [],
						});
					} catch (e) {
						const error = e as Error;
						logger.error(error, error.message);
					}
					return undefined;
				});

			if (
				collectedInteraction &&
				(collectedInteraction.customId === cancelKey || collectedInteraction.customId !== changeKey)
			) {
				await collectedInteraction.update({
					content: i18next.t('command.mod.reason.cancel', {
						lng: locale,
					}),
					components: [],
				});
				return;
			} else if (!collectedInteraction) {
				return;
			}
		} else {
			originalCaseLower = await getCase(interaction.guildId, lower);
			if (!originalCaseLower) {
				await interaction.editReply({
					content: i18next.t('command.mod.common.errors.no_case', {
						case: lower,
						lng: locale,
					}),
					components: [],
				});
				return;
			}
		}

		const success = [];

		for (let caseId = lower; caseId <= upper; caseId++) {
			const originalCase = await getCase(interaction.guildId, caseId);
			if (!originalCase) {
				continue;
			}

			const case_ = await updateCase({
				caseId: originalCase.caseId,
				guildId: interaction.guildId,
				reason: args.reason,
			});

			await upsertCaseLog(interaction.guildId, interaction.user, case_);
			success.push(caseId);
		}

		const message = args.lastcase
			? i18next.t('command.mod.reason.success_multiple', {
					lower_case: Formatters.hyperlink(
						`#${lower}`,
						generateMessageLink(interaction.guildId, logChannel.id, originalCaseLower.logMessageId!),
					),
					upper_case: Formatters.hyperlink(
						`#${upper}`,
						generateMessageLink(interaction.guildId, logChannel.id, originalCaseUpper!.logMessageId!),
					),
					amount: success.length,
					target: upper - lower + 1,
					lng: locale,
			  })
			: i18next.t('command.mod.reason.success', {
					case: Formatters.hyperlink(
						`#${lower}`,
						generateMessageLink(interaction.guildId, logChannel.id, originalCaseLower.logMessageId!),
					),
					lng: locale,
			  });

		await interaction.editReply({
			content: truncate(message, 1000, ''),
			components: [],
		});
	}
}
