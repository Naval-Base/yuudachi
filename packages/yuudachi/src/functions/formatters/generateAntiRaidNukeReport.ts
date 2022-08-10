import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { codeBlock, Guild, hyperlink, User } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { blockquote, checkbox, emptyLine, heading, horizontalRule, list, table } from './markdownUtils.js';
import type { ArgsParam } from '../../Command.js';
import { DATE_FORMAT_WITH_SECONDS } from '../../Constants.js';
import type { AntiRaidNukeMode } from '../../commands/moderation/sub/anti-raid-nuke/coreCommand.js';
import type { AntiRaidNukeCommand } from '../../interactions/index.js';
import { kSQL } from '../../tokens.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';
import { formatAntiRaidResultsToAttachment } from '../logging/formatMembersToAttachment.js';

export type AntiRaidArgsUnion = ArgsParam<typeof AntiRaidNukeCommand>['file'] &
	ArgsParam<typeof AntiRaidNukeCommand>['filter'] &
	ArgsParam<typeof AntiRaidNukeCommand>['modal'];

export type FormatterArgs = Partial<AntiRaidArgsUnion> & {
	mode: AntiRaidNukeMode;
	timeTaken: number;
	dryRun: boolean;
	logMessageUrl?: string;
};

function sortByResultMember(a: AntiRaidNukeResult, b: AntiRaidNukeResult) {
	if (!a.member.joinedTimestamp || !b.member.joinedTimestamp) {
		return 0;
	}

	return b.member.joinedTimestamp - a.member.joinedTimestamp;
}

function sortByResultCase(a: AntiRaidNukeResult, b: AntiRaidNukeResult) {
	if (!a.case || !b.case) {
		return 0;
	}

	return a.case.caseId - b.case.caseId;
}

function resultToTable(result: AntiRaidNukeResult[], dryRun: boolean): { successes: string[][]; failures: string[][] } {
	const failures: string[][] = [];
	const successes: string[][] = [];

	for (const { member, success, error, case: case_ } of result.sort(sortByResultCase)) {
		if (success) {
			successes.push([dryRun ? 'Dry Run' : case_!.caseId.toString(), member.id, member.user.tag]);
		} else {
			failures.push([member.id, member.user.tag, error ?? 'Unknown']);
		}
	}

	return { successes, failures };
}

function paramOrNone(param: string | undefined, locale: string): string {
	return param ?? i18next.t('formatters.anti_raid_nuke.parameters.none', { lng: locale });
}

export async function generateAntiRaidNukeReport(
	guild: Guild,
	user: User,
	result: AntiRaidNukeResult[],
	args: FormatterArgs,
	locale: string,
) {
	const parts = [];
	const t = i18next.t;
	const sql = container.resolve<Sql<any>>(kSQL);

	const cases = result.filter((r) => Boolean(r.case)).map((r) => r.case!);

	parts.push(heading(t('formatters.anti_raid_nuke.title', { lng: locale, guild: guild.name }), 1));

	parts.push(
		heading(t('formatters.anti_raid_nuke.summary.title', { lng: locale }), 2),
		list([
			t('formatters.anti_raid_nuke.summary.mode', { lng: locale, mode: args.mode }),
			t('formatters.anti_raid_nuke.summary.current_time', {
				lng: locale,
				current_time: dayjs().format(DATE_FORMAT_WITH_SECONDS),
			}),
			t('formatters.anti_raid_nuke.summary.time_taken', {
				lng: locale,
				time_taken: ms(Number(args.timeTaken.toFixed(2))),
			}),
			t('formatters.anti_raid_nuke.summary.moderator', { lng: locale, moderator: user.tag }),
			t('formatters.anti_raid_nuke.summary.reason', { lng: locale, reason: paramOrNone(args.reason, locale) }),
			t(`formatters.anti_raid_nuke.summary.${args.dryRun ? 'dry_run' : 'blast_mode'}`, { lng: locale }),
		]),
		emptyLine(),
	);

	const ratio = `${Math.round((result.filter((r) => r.success).length / result.length) * 100)}%`;

	parts.push(
		heading(t('formatters.anti_raid_nuke.results.title', { lng: locale }), 2),
		t('formatters.anti_raid_nuke.results.total', { lng: locale, count: result.length }),
		list([
			t('formatters.anti_raid_nuke.results.banned', { lng: locale, count: result.filter((r) => r.success).length }),
			t('formatters.anti_raid_nuke.results.failed', { lng: locale, count: result.filter((r) => !r.success).length }),
		]),
		blockquote(
			t('formatters.anti_raid_nuke.results.ratio', {
				lng: locale,
				ratio,
			}),
		),
		emptyLine(),
	);

	parts.push(heading(t('formatters.anti_raid_nuke.parameters.title', { lng: locale }), 2));

	if (args.avatar) {
		parts.push(heading(t('formatters.anti_raid_nuke.parameters.avatar', { lng: locale, avatar: args.avatar }), 4));
	}
	if (args.pattern) {
		parts.push(
			heading(t('formatters.anti_raid_nuke.parameters.pattern.title', { lng: locale, pattern: args.pattern }), 4),
			checkbox(
				t('formatters.anti_raid_nuke.parameters.pattern.confusables', { lng: locale }),
				args.confusables === 1 || args.confusables === 3,
			),
			checkbox(t('formatters.anti_raid_nuke.parameters.pattern.insensitive', { lng: locale }), args.insensitive),
			checkbox(t('formatters.anti_raid_nuke.parameters.pattern.full_match', { lng: locale }), args.full_match),
		);
	}
	if (typeof args.zalgo === 'boolean') {
		parts.push(heading(t('formatters.anti_raid_nuke.parameters.zalgo', { lng: locale }), 4));
	}
	if (args.join_after || args.join_before) {
		parts.push(
			heading(t('formatters.anti_raid_nuke.parameters.joined.title', { lng: locale }), 4),
			list([
				t('formatters.anti_raid_nuke.parameters.joined.after', {
					lng: locale,
					after: paramOrNone(args.join_after, locale),
				}),
				t('formatters.anti_raid_nuke.parameters.joined.before', {
					lng: locale,
					before: paramOrNone(args.join_before, locale),
				}),
			]),
		);
	}
	if (args.created_after || args.created_before) {
		parts.push(
			heading(t('formatters.anti_raid_nuke.parameters.created.title', { lng: locale }), 4),
			list([
				t('formatters.anti_raid_nuke.parameters.created.after', {
					lng: locale,
					after: paramOrNone(args.created_after, locale),
				}),
				t('formatters.anti_raid_nuke.parameters.created.before', {
					lng: locale,
					before: paramOrNone(args.created_before, locale),
				}),
			]),
		);
	}
	if (typeof args.confusables === 'number') {
		parts.push(
			heading(t('formatters.anti_raid_nuke.parameters.confusables.title', { lng: locale, mode: args.confusables }), 4),
		);
	}
	if (args.days) {
		parts.push(
			heading(
				t('formatters.anti_raid_nuke.parameters.days', {
					lng: locale,
					count: args.days,
				}),
				4,
			),
		);
	}
	if (args.file) {
		parts.push(
			heading(
				t('formatters.anti_raid_nuke.parameters.file.title', {
					lng: locale,
					file: hyperlink(
						t('formatters.anti_raid_nuke.parameters.file.placeholder', {
							lng: locale,
						}),
						args.file.proxyURL,
					),
				}),
				4,
			),
		);
	}

	parts.push(emptyLine());

	const [nextCase] = await sql<[{ next_case: number }]>`select next_case(${guild.id});`;
	const from = nextCase.next_case - cases.length;
	const to = nextCase.next_case - 1;

	parts.push(heading(t('formatters.anti_raid_nuke.cases.title', { lng: locale }), 2));
	parts.push(
		list([
			cases.length
				? t('formatters.anti_raid_nuke.cases.range', { lng: locale, from, to })
				: t('formatters.anti_raid_nuke.cases.none', { lng: locale }),
			args.logMessageUrl
				? t('formatters.anti_raid_nuke.cases.log_message', {
						lng: locale,
						message: args.logMessageUrl,
				  })
				: t('formatters.anti_raid_nuke.cases.log_message_none', {
						lng: locale,
				  }),
		]),
	);

	parts.push(emptyLine(), horizontalRule(), emptyLine());

	const { successes, failures } = resultToTable(result, args.dryRun);

	parts.push(heading(t('formatters.anti_raid_nuke.successes.title', { lng: locale }), 2));
	if (successes.length) {
		parts.push(
			table(i18next.t('formatters.anti_raid_nuke.successes.tables', { lng: locale, returnObjects: true }), successes),
		);
	} else {
		parts.push(blockquote(heading(t('formatters.anti_raid_nuke.successes.none', { lng: locale }), 3)));
	}

	parts.push(emptyLine(), horizontalRule(), emptyLine());

	parts.push(heading(t('formatters.anti_raid_nuke.failures.title', { lng: locale }), 2));
	if (failures.length) {
		parts.push(
			table(i18next.t('formatters.anti_raid_nuke.failures.tables', { lng: locale, returnObjects: true }), failures),
		);
	} else {
		parts.push(blockquote(heading(t('formatters.anti_raid_nuke.failures.none', { lng: locale }), 3)));
	}

	parts.push(emptyLine(), horizontalRule(), emptyLine());

	parts.push(heading(t('formatters.anti_raid_nuke.raw_data.title', { lng: locale }), 2));
	parts.push(t('formatters.anti_raid_nuke.raw_data.description', { lng: locale }));
	parts.push(emptyLine());
	parts.push(codeBlock('ansi', formatAntiRaidResultsToAttachment(result.sort(sortByResultMember), locale)));

	return parts.join('\n');
}
