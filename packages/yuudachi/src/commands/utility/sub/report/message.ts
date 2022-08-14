import { ButtonStyle, ComponentType, hyperlink, type Message, type ModalSubmitInteraction } from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import type { ArgsParam, InteractionParam } from '../../../../Command.js';
import { TRUST_AND_SAFETY_URL } from '../../../../Constants.js';
import { formatMessageToEmbed } from '../../../../functions/logging/formatMessageToEmbed.js';
import { upsertReportLog } from '../../../../functions/logging/upsertReportLog.js';
import { createReport, ReportType } from '../../../../functions/reports/createReport.js';
import type { ReportCommand } from '../../../../interactions/index.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { parseMessageLink, resolveMessage } from '../../../../util/resolveMessage.js';

type MessageReportArgs = Omit<ArgsParam<typeof ReportCommand>['message'], 'message_link'> & {
	message?: Message;
	message_link?: string;
};

export async function message(
	interaction: InteractionParam | ModalSubmitInteraction,
	args: MessageReportArgs,
	locale: string,
) {
	let resolvedMessage: Message | null | undefined = null;

	if (args.message_link) {
		const parsedLink = parseMessageLink(args.message_link);

		if (!parsedLink) {
			throw new Error(
				i18next.t('command.common.errors.not_message_link', {
					val: args.message_link,
					arg: 'message_link',
					lng: locale,
				}),
			);
		}

		const { guildId, channelId, messageId } = parsedLink;
		resolvedMessage = (await resolveMessage(
			interaction.channelId!,
			guildId!,
			channelId!,
			messageId!,
			locale,
		)) as Message<true>;
	} else {
		resolvedMessage = args.message;
	}

	const reportKey = nanoid();
	const cancelKey = nanoid();

	const reportButton = createButton({
		customId: reportKey,
		label: i18next.t('command.utility.report.commons.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.utility.report.commons.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});

	const contentParts = [
		i18next.t('command.utility.report.message.pending', {
			message_link: hyperlink(
				i18next.t('command.utility.report.message.pending_sub', { lng: locale }),
				resolvedMessage?.url!,
			),
			reason: args.reason,
			lng: locale,
		}),
		'',
		i18next.t('command.utility.report.commons.warnings', {
			trust_and_safety: hyperlink(
				i18next.t('command.utility.report.commons.trust_and_safety_sub', { lng: locale }),
				TRUST_AND_SAFETY_URL,
			),
			lng: locale,
		}),
	];

	const reply = await interaction.editReply({
		content: contentParts.join('\n'),
		embeds: [formatMessageToEmbed(resolvedMessage as Message<true>, locale)],
		components: [createMessageActionRow([cancelButton, reportButton])],
	});

	const collectedInteraction = await reply
		.awaitMessageComponent({
			componentType: ComponentType.Button,
			filter: (i) => i.user.id === interaction.user.id,
			time: 20000,
		})
		.catch(async () => {
			try {
				await interaction.editReply({
					content: i18next.t('command.common.errors.timed_out', { lng: locale }),
					components: [],
				});
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
			return undefined;
		});

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.utility.report.message.cancel', {
				lng: locale,
			}),
			embeds: [],
			components: [],
		});
	} else if (collectedInteraction?.customId === reportKey) {
		await collectedInteraction.deferUpdate();

		const report = await createReport({
			guildId: interaction.guildId!,
			authorId: interaction.user.id,
			authorTag: interaction.user.tag,
			reason: args.reason,
			targetId: resolvedMessage?.author.id!,
			targetTag: resolvedMessage?.author.tag!,
			message: resolvedMessage!,
			type: ReportType.Message,
		});

		await upsertReportLog(interaction.guild!, interaction.user, report, resolvedMessage!);

		await collectedInteraction.editReply({
			content: i18next.t('command.utility.report.message.success', { lng: locale }),
			components: [],
		});
	}
}
