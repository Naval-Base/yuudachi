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
import { parseDate, partitionNukeTargets, releaseNukeLock, TargetRejection } from './utils.js';
import type { ArgsParam } from '../../../../Command.js';
import { ANTI_RAID_NUKE_COLLECTOR_TIMEOUT_SECONDS, DATE_FORMAT_LOGFILE } from '../../../../Constants.js';
import { blastOff } from '../../../../functions/anti-raid/blastOff.js';
import { formatMemberTimestamps } from '../../../../functions/anti-raid/formatMemberTimestamps.js';
import {
	AntiRaidNukeArgsUnion,
	generateAntiRaidNukeReport,
} from '../../../../functions/formatters/generateAntiRaidNukeReport.js';
import { generateFormatterUrl } from '../../../../functions/formatters/generateFormatterUrl.js';
import { insertAntiRaidNukeCaseLog } from '../../../../functions/logging/insertAntiRaidNukeCaseLog.js';
import {
	upsertAntiRaidArchiveLog,
	upsertAntiRaidArchivePendingLog,
} from '../../../../functions/logging/upsertAntiRaidArchiveLog.js';
import { getGuildSetting, SettingsKeys } from '../../../../functions/settings/getGuildSetting.js';
import type { AntiRaidNukeCommand } from '../../../../interactions/index.js';
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
	confirmations: GuildMember[],
	rejections: TargetRejection[],
	pruneDays: number,
	insensitive: boolean,
	mode: AntiRaidNukeMode,
	args: Partial<AntiRaidNukeArgsUnion>,
	locale: string,
) {
	const start = performance.now();
	await collectedInteraction.deferUpdate();

	const {
		confirmedHits,
		rejections: rejectedHits,
		cases,
	} = await blastOff(collectedInteraction, pruneDays, confirmations, rejections, locale);

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
		confirmedHits,
		rejectedHits,
		cases,
		formatterArgs,
	);

	const row = logMessage.components[0];

	await collectedInteraction.editReply({
		content: i18next.t('command.mod.anti_raid_nuke.common.success', {
			count: confirmedHits.length,
			lng: locale,
		}),
		files: [],
		components: row ? [row] : [],
	});

	await releaseNukeLock(collectedInteraction.guildId);
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

	const ignoreRoles = await getGuildSetting<string[]>(interaction.guildId, SettingsKeys.AutomodIgnoreRoles);

	const [targets, rejections] = partitionNukeTargets(members, interaction.user.id, ignoreRoles, locale);

	if (!targets.length) {
		throw new Error(
			`${i18next.t('command.mod.anti_raid_nuke.common.errors.no_hits', {
				lng: locale,
			})}\n\n${prefixedParameterStrings.join('\n')}`,
		);
	}

	const formatterArgs = {
		...args,
		insensitive,
		days: pruneDays as ArgsParam<typeof AntiRaidNukeCommand>['filter']['days'],
		dryRun: false,
		mode,
		timeTaken: 0,
		created_after: parseDate(args.created_after),
		created_before: parseDate(args.created_before),
		join_after: parseDate(args.join_after),
		join_before: parseDate(args.join_before),
		pattern: args.pattern ? parseRegex(args.pattern, insensitive, args.full_match)?.toString() : undefined,
		logMessageUrl: undefined,
	};

	const banKey = nanoid();
	const cancelKey = nanoid();

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

	const potentialHitsDate = dayjs().format(DATE_FORMAT_LOGFILE);
	const { creationRange, joinRange } = formatMemberTimestamps(members);

	const buttons = hide ? [] : [cancelButton, banButton];
	const preliminiaryReport = await generateAntiRaidNukeReport(
		interaction.guild,
		interaction.user,
		targets,
		rejections,
		[],
		formatterArgs,
		true,
	);

	const reply = await interaction.editReply({
		content: `${i18next.t('command.mod.anti_raid_nuke.common.pending', {
			count: members.size,
			creation_range: creationRange,
			join_range: joinRange,
			lng: locale,
		})}\n\n${prefixedParameterStrings.join('\n')}`,
		files: [
			{
				name: `${potentialHitsDate}-anti-raid-nuke-preliminary.md`,
				attachment: Buffer.from(preliminiaryReport),
			},
		],
		components: buttons.length ? [createMessageActionRow(buttons)] : [],
	});

	const formattedReportButton = createButton({
		label: i18next.t('command.mod.anti_raid_nuke.common.buttons.formatted', { lng: locale }),
		style: ButtonStyle.Link,
		url: generateFormatterUrl(reply.attachments.first()!.url),
	});

	await interaction.editReply({
		components: [createMessageActionRow([...buttons, formattedReportButton])],
	});

	const collectedInteraction = (await reply
		.awaitMessageComponent({
			filter: (collected) => collected.user.id === interaction.user.id,
			componentType: ComponentType.Button,
			time: ANTI_RAID_NUKE_COLLECTOR_TIMEOUT_SECONDS * 1000,
		})
		.catch(async () => {
			await releaseNukeLock(interaction.guildId);
			await interaction.editReply({
				content: i18next.t('command.common.errors.timed_out', { lng: locale }),
				components: [createMessageActionRow([formattedReportButton])],
			});
		})) as ButtonInteraction<'cached'> | void;

	if (collectedInteraction) {
		await releaseNukeLock(collectedInteraction.guildId);

		switch (collectedInteraction.customId) {
			case cancelKey: {
				await collectedInteraction.update({
					content: i18next.t('command.mod.anti_raid_nuke.common.cancel', {
						lng: locale,
					}),
					components: [createMessageActionRow([formattedReportButton])],
				});
				break;
			}

			case banKey: {
				await launchNuke(collectedInteraction, targets, rejections, pruneDays, insensitive, mode, args, locale);
			}
		}
	}
}
