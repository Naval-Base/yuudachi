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
	type Message,
} from 'discord.js';
import i18next from 'i18next';
import { nanoid } from 'nanoid';
import { parseDate, releaseNukeLock } from './utils.js';
import type { ArgsParam } from '../../../../Command.js';
import { ANTI_RAID_NUKE_COLLECTOR_TIMEOUT_SECONDS, DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { blastOff } from '../../../../functions/anti-raid/blastOff.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import type { AntiRaidNukeArgsUnion } from '../../../../functions/formatters/generateAntiRaidNukeReport.js';
import {
	formatAntiRaidResultsToAttachment,
	formatMembersToAttachment,
} from '../../../../functions/logging/formatMembersToAttachment.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import {
	sendDryRunAntiRaidArchiveLog,
	upsertAntiRaidArchiveLog,
	upsertAntiRaidArchivePendingLog,
} from '../../../../functions/logging/upsertAntiRaidArchiveLog.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';
import { logger } from '../../../../logger.js';
import { createButton } from '../../../../util/button.js';
import { createMessageActionRow } from '../../../../util/messageActionRow.js';
import { parseRegex } from '../../../../util/parseRegex.js';

export enum AntiRaidNukeMode {
	File = 'file',
	Filter = 'filter',
	Modal = 'modal',
}

async function launchNuke(
	collectedInteraction: ButtonInteraction<'cached'>,
	members: Collection<Snowflake, GuildMember>,
	pruneDays: number,
	insensitive: boolean,
	mode: AntiRaidNukeMode,
	args: Partial<AntiRaidNukeArgsUnion>,
	locale: string,
) {
	const start = performance.now();
	await collectedInteraction.deferUpdate();

	const { result, cases } = await blastOff(
		collectedInteraction,
		{
			days: pruneDays,
			dryRun: false,
		},
		members,
		locale,
	);

	const timeTaken = performance.now() - start;

	let caseMessage: Message | null = null;
	const pendingArchiveMessage = await upsertAntiRaidArchivePendingLog(collectedInteraction.guild);
	if (cases.length) {
		caseMessage = await insertAntiRaidNukeCaseLog(
			collectedInteraction.guild,
			collectedInteraction.user,
			cases,
			args.reason ??
				i18next.t('command.mod.anti_raid_nuke.common.success', {
					count: cases.length,
					lng: locale,
				}),
			pendingArchiveMessage.url,
		);
	}

	const membersHitDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const formatterArgs = {
		...args,
		insensitive,
		days: pruneDays as ArgsParam<typeof AntiRaidNukeCommand>['filter']['days'],
		dryRun: false,
		mode,
		timeTaken,
		created_after: parseDate(args.created_after),
		created_before: parseDate(args.created_before),
		join_after: parseDate(args.join_after),
		join_before: parseDate(args.join_before),
		pattern: args.pattern ? parseRegex(args.pattern, insensitive, args.full_match)?.toString() : undefined,
		logMessageUrl: caseMessage?.url,
	};

	const logMessage = await upsertAntiRaidArchiveLog(
		collectedInteraction.guild,
		collectedInteraction.user,
		pendingArchiveMessage,
		result,
		cases,
		formatterArgs,
	);

	const row = logMessage.components[0];

	await collectedInteraction.editReply({
		content: i18next.t('command.mod.anti_raid_nuke.common.success', {
			count: result.filter((r) => r.success).length,
			lng: locale,
		}),
		files: [
			{
				name: `${membersHitDate}-anti-raid-nuke-hits.ansi`,
				attachment: Buffer.from(formatAntiRaidResultsToAttachment(result, locale)),
			},
		],
		components: row ? [row] : [],
	});

	await releaseNukeLock(collectedInteraction.guildId);
}

async function sendDryRunResult(
	collectedInteraction: ButtonInteraction<'cached'>,
	members: Collection<Snowflake, GuildMember>,
	pruneDays: number,
	insensitive: boolean,
	mode: AntiRaidNukeMode,
	args: Partial<AntiRaidNukeArgsUnion>,
	locale: string,
) {
	const start = performance.now();

	const { result, cases } = await blastOff(
		collectedInteraction,
		{
			days: pruneDays,
			dryRun: true,
		},
		members,
		locale,
	);

	const timeTaken = performance.now() - start;

	const formatterArgs = {
		...args,
		insensitive,
		days: pruneDays as ArgsParam<typeof AntiRaidNukeCommand>['filter']['days'],
		dryRun: true,
		mode,
		timeTaken,
		created_after: parseDate(args.created_after),
		created_before: parseDate(args.created_before),
		join_after: parseDate(args.join_after),
		join_before: parseDate(args.join_before),
		pattern: args.pattern ? parseRegex(args.pattern, insensitive, args.full_match)?.toString() : undefined,
	};

	await sendDryRunAntiRaidArchiveLog(collectedInteraction, result, cases, formatterArgs);
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
	const insensitive = args.insensitive ?? true;
	const hide = args.hide ?? false;

	const prefixedParameterStrings = [
		i18next.t('command.mod.anti_raid_nuke.common.parameters.heading', { lng: locale }),
		i18next.t('command.mod.anti_raid_nuke.common.parameters.days', {
			count: pruneDays,
			lng: locale,
		}),
		...parameterStrings,
	];

	if (hide) {
		prefixedParameterStrings.push(i18next.t('command.mod.anti_raid_nuke.common.parameters.hide', { lng: locale }));
	}

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
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.execute', { lng: locale }),
		customId: banKey,
		style: ButtonStyle.Danger,
	});
	const cancelButton = createButton({
		label: i18next.t('command.common.buttons.cancel', { lng: locale }),
		customId: cancelKey,
		style: ButtonStyle.Secondary,
	});
	const dryRunButton = createButton({
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.dry_run', { lng: locale }),
		customId: dryRunKey,
		style: ButtonStyle.Primary,
	});

	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const { creationRange, joinRange } = formatMemberTimestamps(members);

	let buttons = [cancelButton];
	if (!hide) {
		buttons = [...buttons, banButton];
	}

	const row = createMessageActionRow([...buttons, dryRunButton]);

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
		components: [row],
	});

	const buttonCollector = reply
		.createMessageComponentCollector({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: ANTI_RAID_NUKE_COLLECTOR_TIMEOUT_SECONDS * 1000,
		})
		.on('collect', async (collectedInteraction: ButtonInteraction<'cached'>) => {
			switch (collectedInteraction.customId) {
				case cancelKey: {
					await collectedInteraction.update({
						content: i18next.t('command.mod.anti_raid_nuke.common.cancel', {
							lng: locale,
						}),
						components: [],
					});
					buttonCollector.stop('cancel');
					break;
				}

				case banKey: {
					await launchNuke(collectedInteraction, members, pruneDays, insensitive, mode, args, locale);
					buttonCollector.stop('nuke');
					break;
				}
				case dryRunKey: {
					await sendDryRunResult(collectedInteraction, members, pruneDays, insensitive, mode, args, locale);
					break;
				}
			}
		})
		.on('end', async (_, reason) => {
			await releaseNukeLock(interaction.guildId);
			try {
				if (reason === 'time') {
					await interaction.editReply({
						content: i18next.t('command.common.errors.timed_out', { lng: locale }),
						components: [],
					});
				}
			} catch (e) {
				const error = e as Error;
				logger.error(error, error.message);
			}
		});
}
