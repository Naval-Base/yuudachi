import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { Formatters, Guild, TextChannel } from 'discord.js';
import { DATE_FORMAT_LOGFILE } from '../../Constants.js';
import type { AntiRaidResult } from '../../commands/moderation/anti-raid-nuke.js';
import type { AntiRaidFileArgs } from '../../commands/moderation/sub/anti-raid-nuke/file.js';
import type { AntiRaidFilterArgs } from '../../commands/moderation/sub/anti-raid-nuke/filter.js';
import type { AntiRaidModalArgs } from '../../commands/moderation/sub/anti-raid-nuke/modal.js';
import { colorBasedOnBoolean, colorBasedOnDifference } from '../../util/color.js';
import { generateMessageLink } from '../../util/generateMessageLink.js';
import { resolveTimestamp } from '../../util/timestamp.js';
import type { Case } from '../cases/createCase.js';

export enum AntiRaidNukeModes {
	Filter = 'filter',
	Modal = 'modal',
	File = 'file',
}

export type ReportArgs = {
	mode: AntiRaidNukeModes;
	time: number;
	cases: Case[];
	logChannel: TextChannel;
	dryRun: boolean;
} & Partial<AntiRaidFileArgs & AntiRaidFilterArgs & AntiRaidModalArgs>;

export function reportSort(a: AntiRaidResult, b: AntiRaidResult) {
	if (!a.member.joinedTimestamp || !b.member.joinedTimestamp) {
		return 0;
	}
	return b.member.joinedTimestamp - a.member.joinedTimestamp;
}

function sortByCase(a: AntiRaidResult, b: AntiRaidResult) {
	if (!a.caseId || !b.caseId) {
		return 0;
	}
	return a.caseId - b.caseId;
}

export function generateReportTargetInfo(r: AntiRaidResult) {
	const colorId = colorBasedOnBoolean(r.success, r.member.user.id);
	const colorJoin = colorBasedOnDifference(
		Date.now() - (r.member.joinedTimestamp ?? Date.now()),
		dayjs(r.member.joinedTimestamp).format(DATE_FORMAT_LOGFILE),
	);
	const colorCreation = colorBasedOnDifference(
		Date.now() - r.member.user.createdTimestamp,
		dayjs(r.member.user.createdTimestamp).format(DATE_FORMAT_LOGFILE),
	);

	console.log(colorId, colorJoin, colorCreation);

	console.log(`${colorId} | ${r.member.user.tag} | Join: ${colorJoin} | Creation: ${colorCreation}`);

	return `${colorId} | Join: ${colorJoin} | Creation: ${colorCreation} | ${r.member.user.tag}`;
}

export function resolveDateLocale(timestamp: number | undefined, discord = true): string {
	return timestamp
		? discord
			? Formatters.time(dayjs(timestamp).unix(), Formatters.TimestampStyles.ShortDateTime)
			: dayjs(timestamp).format(DATE_FORMAT_LOGFILE)
		: Formatters.inlineCode('Not specified');
}

function markBox(input: any): ' ' | 'x' {
	return input ? 'x' : ' ';
}

export function formatReport(guild: Guild, args: ReportArgs, results: AntiRaidResult[]): string {
	const [successes, failures] = results.reduce<[AntiRaidResult[], AntiRaidResult[]]>(
		(acc, result) => {
			acc[result.success ? 0 : 1]?.push(result);
			return acc;
		},
		[[], []],
	);

	const lines = [
		`# Anti-Raid-Nuke Report on ${Formatters.inlineCode(guild.name)}`,
		'## **Summary**',
		`- **Mode:** ${Formatters.inlineCode(args.mode)}`,
		`- **Current Time:** ${dayjs().format(DATE_FORMAT_LOGFILE)}`,
		`- **Time Taken:** ${ms(args.time, true)}`,
		args.dryRun ? '- **Operated in dry-run mode**\n' : '',
		'## **Results**',
		`**Total:** ${Formatters.inlineCode(results.length.toString())}`,
		`- ${successes.length} members were successfully banned`,
		`- ${failures.length} members were not banned`,
		`> Ratio: ${(successes.length / results.length).toFixed(2)}`,
		'',
		'**Cases:**',
		`- From ${args.cases[0]?.caseId ?? 'Unknown'} to ${args.cases.at(args.cases.length - 1)?.caseId ?? 'Unknown'}`,
		`- Log Message: ${
			args.cases[0]?.logMessageId
				? Formatters.hyperlink(
						'Beam me up, Yuu',
						generateMessageLink(guild.id, args.logChannel.id, args.cases[0].logMessageId),
				  )
				: Formatters.inlineCode('Not specified')
		}`,
		'',
		'## **Details**',
		'',
	];

	if (args.file) {
		lines.push(`> **File:** ${Formatters.hyperlink('File parsed', args.file.url)}`, '');
	}

	if (args.join_from || args.join_to) {
		lines.push(
			...[
				'### Join Date:',
				`- From: ${resolveDateLocale(resolveTimestamp(args.join_from), false)}`,
				`- To: ${resolveDateLocale(resolveTimestamp(args.join_to), false)}`,
				'',
			],
		);
	}

	if (args.created_from || args.created_to) {
		lines.push(
			...[
				'### Creation Date:',
				`- From: ${resolveDateLocale(resolveTimestamp(args.created_from), false)}`,
				`- To: ${resolveDateLocale(resolveTimestamp(args.created_to), false)}`,
				'',
			],
		);
	}

	if (args.pattern) {
		lines.push(
			...[
				`### Pattern Used: ${Formatters.inlineCode(args.pattern)}`,
				`- [${markBox(args.insensitive)}] Case-insensitive`,
				`- [${markBox(args.confusables === 1 || args.confusables === 3)}] Remove confusables`,
				`- [${markBox(args.full_match)}] Full match`,
				'',
			],
		);
	}

	if (typeof args.confusables === 'number') {
		lines.push(
			...[
				'### Confusables:',
				`- Mode: ${Formatters.inlineCode(
					args.confusables === 0
						? 'Off'
						: args.confusables === 1
						? 'Only Pattern'
						: args.confusables === 2
						? 'Only Filter Members'
						: 'Pattern & Filter Members',
				)}`,
				'',
			],
		);
	}

	if (typeof args.zalgo === 'boolean') {
		lines.push(`> - [${markBox(args.zalgo)}] Filter zalgo text`, '');
	}

	if (args.avatar) {
		lines.push(
			...[
				'### Avatar:',
				`- ${Formatters.inlineCode(args.avatar.toLowerCase() === 'none' ? 'Matching no avatars.' : args.avatar)}`,
				'',
			],
		);
	}

	if (args.reason) {
		lines.push(...['### Reason:', `\t${args.reason}`, '']);
	}

	if (typeof args.days === 'number') {
		lines.push(
			...[
				'### Prunning Days:',
				`- ${Formatters.inlineCode(
					args.days.toString() + (args.days === 1 ? ' day of messages' : ' days of messages'),
				)}`,
				'',
			],
		);
	}

	lines.push(...['', '## **Successes**', '']);
	if (successes.length) {
		lines.push(
			'| CaseId | Member Id | Username |',
			'|:-------|:---------:|:-------:|',
			...results
				.filter((r) => r.success)
				.sort(sortByCase)
				.map((r) => `| ${r.caseId ?? 'None'} | ${r.member.user.id} | ${r.member.user.tag}`),
		);
	} else {
		lines.push('> ## No successes, something went wrong.');
	}

	lines.push(...['', '## **Failures**', '']);
	if (failures.length) {
		lines.push(
			'| Member Id | Username | Error |',
			'|:-------|:---------:|:-------:|',
			...results
				.filter((r) => !r.success)
				.sort(reportSort)
				.map((r) => `| ${r.member.user.id} | ${r.member.user.tag} | ${r.error ?? 'Unknown error'}`),
		);
	} else {
		lines.push('> ## No failures, everything went fine.');
	}

	lines.push(...['', '## Raw Data', '', 'Sorted by join date descending, highlight based on account age', '']);
	lines.push(...['```ansi', ...results.sort(reportSort).map((r) => generateReportTargetInfo(r)), '```']);

	return lines.join('\n');
}
