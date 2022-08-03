import dayjs from 'dayjs';
import {
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	Collection,
	ComponentType,
	GuildMember,
	ModalSubmitInteraction,
	Snowflake,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { blastOff } from '../../../../functions/anti-raid/blastOff.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import {
	formatAntiRaidResultsToAttachment,
	formatMembersToAttachment,
} from '../../../../functions/logging/formatMembersToAttachment.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertGeneralLog.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';

export interface IdValidationResult {
	validMembers: Collection<string, GuildMember>;
	validIdCount: number;
	invalidIdCount: number;
	totalIdCount: number;
}

export async function validateMemberIds(
	interaction: ChatInputCommandInteraction<'cached'> | ModalSubmitInteraction<'cached'>,
	ids: Set<Snowflake>,
	emptyResultErrorText: string,
): Promise<IdValidationResult> {
	const fetchedMembers = await interaction.guild.members.fetch({ force: true });
	const result = new Collection<string, GuildMember>();

	for (const id of ids) {
		const member = fetchedMembers.get(id);

		if (member) {
			result.set(id, member);
		}
	}

	if (!result.size) {
		throw new Error(emptyResultErrorText);
	}

	return {
		validMembers: result,
		validIdCount: result.size,
		invalidIdCount: ids.size - result.size,
		totalIdCount: ids.size,
	};
}

export async function handleAntiRaidNuke(
	interaction: ChatInputCommandInteraction<'cached'> | ModalSubmitInteraction<'cached'>,
	members: Collection<Snowflake, GuildMember>,
	locale: string,
	parameterStrings: string[],
	reason?: string,
	days?: number,
) {
	if (!members.size) {
		await interaction.editReply({
			content: `${i18next.t('command.mod.anti_raid_nuke.common.errors.no_hits', {
				lng: locale,
			})}\n\n${parameterStrings.join('\n')}`,
		});
	}

	const pruneDays = Math.min(Math.max(Number(days ?? 1), 0), 7);

	parameterStrings.splice(
		0,
		0,
		i18next.t('command.mod.anti_raid_nuke.common.parameters.heading', { lng: locale }),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.days', {
			count: pruneDays,
			lng: locale,
		}),
	);

	const banKey = nanoid();
	const cancelKey = nanoid();
	const dryRunKey = nanoid();

	const banButton = createButton({
		customId: banKey,
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.execute', { lng: locale }),
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		customId: cancelKey,
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		customId: dryRunKey,
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.dry_run', { lng: locale }),
		style: ButtonStyle.Primary,
	});

	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const { creationRange, joinRange } = formatMemberTimestamps(members);

	const reply = await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.common.pending', {
			count: members.size,
			creation_range: creationRange,
			join_range: joinRange,
			lng: locale,
		})}\n\n${parameterStrings.join('\n')}`,
		files: [
			{
				name: `${potentialHitsDate}-anti-raid-nuke-list.txt`,
				attachment: Buffer.from(formatMembersToAttachment(members, locale)),
			},
		],
		components: [createMessageActionRow([cancelButton, banButton, dryRunButton])],
	});

	const collectedInteraction = (await reply
		.awaitMessageComponent({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: 60000,
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
		})) as ButtonInteraction<'cached'> | undefined;

	if (collectedInteraction?.customId === cancelKey) {
		await collectedInteraction.update({
			content: i18next.t('command.mod.anti_raid_nuke.common.cancel', {
				lng: locale,
			}),
			components: [],
		});
	} else if (collectedInteraction?.customId === banKey || collectedInteraction?.customId === dryRunKey) {
		const dryRunMode = collectedInteraction.customId === dryRunKey;

		const content =
			collectedInteraction.message.content +
			(dryRunMode ? `\n\n${i18next.t('command.mod.anti_raid_nuke.common.parameters.dry_run', { lng: locale })}` : '');

		await collectedInteraction.update({
			content,
			components: [
				createMessageActionRow([
					{ ...cancelButton, disabled: true },
					{ ...banButton, disabled: true },
				]),
			],
		});

		const { result, cases } = await blastOff(
			collectedInteraction,
			{
				days: pruneDays,
				dryRun: dryRunMode,
			},
			members,
			locale,
		);

		if (!dryRunMode && cases.length) {
			await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				cases,
				reason ??
					i18next.t('command.mod.anti_raid_nuke.common.success', {
						count: result.filter((r) => r.success).length,
						lng: locale,
					}),
			);
		}

		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		await upsertAntiRaidNukeReport(collectedInteraction.guild, collectedInteraction.user, result, dryRunMode);

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.common.success', {
				count: result.filter((r) => r.success).length,
				lng: locale,
			}),
			files: [
				{
					name: `${membersHitDate}-anti-raid-nuke-hits.txt`,
					attachment: Buffer.from(formatAntiRaidResultsToAttachment(result, locale)),
				},
			],
			components: [],
		});
	}
}
