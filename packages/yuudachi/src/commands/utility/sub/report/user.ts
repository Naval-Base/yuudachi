import { type APIEmbed, ButtonStyle, ComponentType, hyperlink } from 'discord.js';
import i18next from 'i18next';
import type { Redis } from 'ioredis';
import { nanoid } from 'nanoid';
import { container } from 'tsyringe';
import type { ArgsParam, InteractionParam } from '../../../../Command.js';
import { Color, REPORT_USER_EXPIRE_SECONDS, TRUST_AND_SAFETY_URL } from '../../../../Constants.js';
import { upsertReportLog } from '../../../../functions/logging/upsertReportLog.js';
import { createReport, ReportType } from '../../../../functions/reports/createReport.js';
import type { ReportCommand } from '../../../../interactions/index.js';
import { logger } from '../../../../logger.js';
import { kRedis } from '../../../../tokens.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

export async function user(
	interaction: InteractionParam,
	args: ArgsParam<typeof ReportCommand>['user'],
	locale: string,
) {
	const redis = container.resolve<Redis>(kRedis);
	const key = `guild:${interaction.guildId}:report:user:${args.user.user.id}`;

	const {
		user: { member },
		reason,
		attachment,
	} = args;

	if (!member) {
		throw new Error(i18next.t('command.common.errors.target_not_found', { lng: locale }));
	}

	if (member.id === interaction.user.id) {
		throw new Error(i18next.t('command.utility.report.commons.errors.no_self', { lng: locale }));
	}

	if (await redis.exists(key)) {
		throw new Error(i18next.t('command.utility.report.commons.errors.recently_reported.user', { lng: locale }));
	}

	const attachmentIsImage = attachment.contentType === 'image/jpeg' || attachment.contentType === 'image/png';

	if (!attachmentIsImage) {
		throw new Error(i18next.t('command.utility.report.commons.errors.invalid_attachment', { lng: locale }));
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
	const trustAndSafetyButton = createButton({
		label: i18next.t('command.utility.report.commons.buttons.trust_and_safety', { lng: locale }),
		url: TRUST_AND_SAFETY_URL,
		style: ButtonStyle.Link,
	});

	const contentParts = [
		i18next.t('command.utility.report.user.pending', {
			user: `${member.user.toString()} - ${member.user.tag} (${member.user.id})`,
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

	const embed: APIEmbed = {
		author: {
			name: `${member.user.tag} (${member.user.id})`,
			icon_url: member.user.displayAvatarURL(),
		},
		color: Color.DiscordEmbedBackground,
	};

	const reply = await interaction.editReply({
		content: contentParts.join('\n'),
		embeds: [
			{
				...embed,
				image: {
					url: attachment.url,
				},
			},
		],
		components: [createMessageActionRow([cancelButton, reportButton, trustAndSafetyButton])],
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
			content: i18next.t('command.utility.report.user.cancel', {
				lng: locale,
			}),
			embeds: [],
			components: [],
		});
	} else if (collectedInteraction?.customId === reportKey) {
		await collectedInteraction.deferUpdate();

		const report = await createReport({
			guildId: interaction.guildId,
			authorId: interaction.user.id,
			authorTag: interaction.user.tag,
			reason,
			targetId: member.id,
			targetTag: member.user.tag,
			attachmentUrl: attachment.proxyURL,
			type: ReportType.User,
		});

		await upsertReportLog(interaction.guild, report);
		await redis.setex(key, REPORT_USER_EXPIRE_SECONDS, '');

		await collectedInteraction.editReply({
			content: i18next.t('command.utility.report.user.success', { lng: locale }),
			embeds: [embed],
			components: [createMessageActionRow([trustAndSafetyButton])],
		});
	}
}
