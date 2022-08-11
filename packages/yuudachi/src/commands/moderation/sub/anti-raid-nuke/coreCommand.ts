import { performance } from 'node:perf_hooks';
import dayjs from 'dayjs';
import {
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	Collection,
	ComponentType,
	type GuildMember,
	type ModalSubmitInteraction,
	type Snowflake,
	type ActionRowData,
	type ButtonComponent,
	type Message,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { DATE_FORMAT_LOGFILE, DATE_FORMAT_WITH_SECONDS } from '../../../../Constants.js';
import { blastOff } from '../../../../functions/anti-raid/blastOff.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import type { Case } from '../../../../functions/cases/createCase.js';
import type { AntiRaidNukeArgsUnion } from '../../../../functions/formatters/generateAntiRaidNukeReport.js';
import {
	formatAntiRaidResultsToAttachment,
	formatMembersToAttachment,
} from '../../../../functions/logging/formatMembersToAttachment.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import { upsertAntiRaidNukeReport } from '../../../../functions/logging/upsertAntiRaidArchiveLog.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { parseRegex } from '../../../../util/parseRegex.js';
import { resolveTimestamp } from '../../../../util/timestamp.js';

export interface IdValidationResult {
	validMembers: Collection<string, GuildMember>;
	validIdCount: number;
	invalidIdCount: number;
	totalIdCount: number;
}

export enum AntiRaidNukeMode {
	File = 'file',
	Filter = 'filter',
	Modal = 'modal',
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

function parseDate(date?: string | null | undefined) {
	return date ? dayjs(resolveTimestamp(date)).format(DATE_FORMAT_WITH_SECONDS) : undefined;
}

export async function handleAntiRaidNuke(
	interaction: ChatInputCommandInteraction<'cached'> | ModalSubmitInteraction<'cached'>,
	members: Collection<Snowflake, GuildMember>,
	mode: AntiRaidNukeMode,
	parameterStrings: string[],
	args: Partial<AntiRaidNukeArgsUnion>,
	locale: string,
) {
	const pruneDays = Math.min(Math.max(Number(args.days ?? 1), 0), 7);
	const prefixedParameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.common.parameters.heading', { lng: locale }),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.days', {
			count: pruneDays,
			lng: locale,
		}),
		...parameterStrings,
	];

	if (!members.size) {
		throw new Error(
			`${i18next.t('command.mod.anti_raid_nuke.common.errors.no_hits', {
				lng: locale,
			})}\n\n${prefixedParameterStrings.join('\n')}`,
		);
	}

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
		})}\n\n${prefixedParameterStrings.join('\n')}`,
		files: [
			{
				name: `${potentialHitsDate}-anti-raid-nuke-list.ansi`,
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

	if (!collectedInteraction || collectedInteraction.customId === cancelKey) {
		const payload = {
			content: i18next.t(`command.mod.anti_raid_nuke.common.${collectedInteraction ? 'cancel' : 'timeout'}`, {
				lng: locale,
			}),
			components: [],
		};
		if (!collectedInteraction) {
			throw new Error(payload.content);
		}
		await collectedInteraction.update(payload);
	} else if (collectedInteraction.customId === banKey || collectedInteraction.customId === dryRunKey) {
		const dryRunMode = collectedInteraction.customId === dryRunKey;

		const content =
			collectedInteraction.message.content +
			(dryRunMode ? `\n\n${i18next.t('command.mod.anti_raid_nuke.common.parameters.dry_run', { lng: locale })}` : '');

		await collectedInteraction.update({
			content,
			components: [],
		});

		const start = performance.now();

		const result = await blastOff(
			collectedInteraction,
			{
				days: pruneDays,
				dryRun: dryRunMode,
			},
			members,
			locale,
		);

		const cases = result.map((c) => c.case).filter(Boolean) as Case[];

		const timeTaken = performance.now() - start;

		let caseMessage: Message | null = null;
		const successResults = result.filter((r) => r.success);

		const archiveMessage = await upsertAntiRaidNukeReport(
			collectedInteraction.guild,
			collectedInteraction.user,
			successResults,
			dryRunMode,
		);

		if (!dryRunMode && cases.length) {
			caseMessage = await insertAntiRaidNukeCaseLog(
				collectedInteraction.guild,
				collectedInteraction.user,
				cases,
				args.reason ??
					i18next.t('command.mod.anti_raid_nuke.common.success', {
						count: cases.length,
						lng: locale,
					}),
				archiveMessage.url,
			);
		}

		const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);

		const logMessage = await upsertAntiRaidNukeReport(collectedInteraction.guild, collectedInteraction.user, result, {
			...args,
			dryRun: dryRunMode,
			mode,
			timeTaken,
			created_after: parseDate(args.created_after),
			created_before: parseDate(args.created_before),
			join_after: parseDate(args.join_after),
			join_before: parseDate(args.join_before),
			pattern: args.pattern ? parseRegex(args.pattern, args.insensitive, args.full_match)?.toString() : undefined,
			logMessageUrl: caseMessage?.url,
		});

		const row = logMessage!.components[0] as ActionRowData<ButtonComponent>;

		await collectedInteraction.editReply({
			content: i18next.t('command.mod.anti_raid_nuke.common.success', {
				count: cases.length,
				lng: locale,
			}),
			files: [
				{
					name: `${membersHitDate}-anti-raid-nuke-hits.ansi`,
					attachment: Buffer.from(formatAntiRaidResultsToAttachment(successResults, locale)),
				},
			],
			components: [row],
		});
	}
}
