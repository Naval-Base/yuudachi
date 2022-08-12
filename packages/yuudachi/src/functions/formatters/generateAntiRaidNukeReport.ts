import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { codeBlock, type Guild, hyperlink, type User, Snowflake } from 'discord.js';
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
import type { Case } from '../cases/createCase.js';
import { formatAntiRaidResultsToAttachment } from '../logging/formatMembersToAttachment.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export type AntiRaidNukeArgsUnion = ArgsParam<typeof AntiRaidNukeCommand>['file'] &
	ArgsParam<typeof AntiRaidNukeCommand>['filter'] &
	ArgsParam<typeof AntiRaidNukeCommand>['modal'];

export type FormatterArgs = Partial<AntiRaidNukeArgsUnion> & {
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

function findCase(userId: Snowflake, cases: Case[]) {
	return cases.find((case_) => case_.targetId === userId)!;
}

function resultToTable(result: AntiRaidNukeResult[], cases: Case[], dryRun: boolean) {
	const failures: string[][] = [];
	const successes: string[][] = [];

	for (const { member, success, error } of result) {
		if (success) {
			successes.push([dryRun ? 'Dry Run' : findCase(member.id, cases).caseId.toString(), member.id, member.user.tag]);
		} else {
			failures.push([member.id, member.user.tag, error ?? 'Unknown']);
		}
	}

	return { successes, failures } as const;
}

function paramOrNone(param: string | undefined, locale: string): string {
	return param ?? i18next.t('formatters.anti_raid_nuke.parameters.none', { lng: locale });
}

export async function generateAntiRaidNukeReport(
	guild: Guild,
	user: User,
	result: AntiRaidNukeResult[],
	cases: Case[],
	args: FormatterArgs,
) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);

	const parts = [];

	parts.push(
		heading(i18next.t('formatters.anti_raid_nuke.title', { guild: guild.name, lng: locale }), 1),
		heading(i18next.t('formatters.anti_raid_nuke.summary.title', { lng: locale }), 2),
		list([
			i18next.t('formatters.anti_raid_nuke.summary.mode', { mode: args.mode, lng: locale }),
			i18next.t('formatters.anti_raid_nuke.summary.current_time', {
				current_time: dayjs().format(DATE_FORMAT_WITH_SECONDS),
				lng: locale,
			}),
			i18next.t('formatters.anti_raid_nuke.summary.time_taken', {
				time_taken: ms(Number(args.timeTaken.toFixed(2))),
				lng: locale,
			}),
			i18next.t('formatters.anti_raid_nuke.summary.moderator', { moderator: user.tag, lng: locale }),
			i18next.t('formatters.anti_raid_nuke.summary.reason', { reason: paramOrNone(args.reason, locale), lng: locale }),
			i18next.t(`formatters.anti_raid_nuke.summary.${args.dryRun ? 'dry_run' : 'blast_mode'}`, { lng: locale }),
		]),
		emptyLine(),
	);

	const successResults = result.filter((r) => r.success);
	const failedResults = result.filter((r) => !r.success);
	const ratio = `${Math.round((successResults.length / result.length) * 100)}%`;

	parts.push(
		heading(i18next.t('formatters.anti_raid_nuke.results.title', { lng: locale }), 2),
		i18next.t('formatters.anti_raid_nuke.results.total', { count: result.length, lng: locale }),
		list([
			i18next.t('formatters.anti_raid_nuke.results.banned', {
				count: successResults.length,
				lng: locale,
			}),
			i18next.t('formatters.anti_raid_nuke.results.failed', {
				count: failedResults.length,
				lng: locale,
			}),
		]),
		blockquote(
			i18next.t('formatters.anti_raid_nuke.results.ratio', {
				ratio,
				lng: locale,
			}),
		),
		emptyLine(),
	);

	parts.push(heading(i18next.t('formatters.anti_raid_nuke.parameters.title', { lng: locale }), 2));

	if (args.avatar) {
		parts.push(
			heading(i18next.t('formatters.anti_raid_nuke.parameters.avatar', { avatar: args.avatar, lng: locale }), 4),
		);
	}

	if (args.pattern) {
		parts.push(
			heading(
				i18next.t('formatters.anti_raid_nuke.parameters.pattern.title', { pattern: args.pattern, lng: locale }),
				4,
			),
			checkbox(
				i18next.t('formatters.anti_raid_nuke.parameters.pattern.confusables', { lng: locale }),
				args.confusables === 1 || args.confusables === 3,
			),
			checkbox(
				i18next.t('formatters.anti_raid_nuke.parameters.pattern.insensitive', { lng: locale }),
				args.insensitive,
			),
			checkbox(i18next.t('formatters.anti_raid_nuke.parameters.pattern.full_match', { lng: locale }), args.full_match),
		);
	}

	if (args.zalgo) {
		parts.push(heading(i18next.t('formatters.anti_raid_nuke.parameters.zalgo', { lng: locale }), 4));
	}

	if (args.join_after || args.join_before) {
		parts.push(
			heading(i18next.t('formatters.anti_raid_nuke.parameters.joined.title', { lng: locale }), 4),
			list([
				i18next.t('formatters.anti_raid_nuke.parameters.joined.after', {
					after: paramOrNone(args.join_after, locale),
					lng: locale,
				}),
				i18next.t('formatters.anti_raid_nuke.parameters.joined.before', {
					before: paramOrNone(args.join_before, locale),
					lng: locale,
				}),
			]),
		);
	}

	if (args.created_after || args.created_before) {
		parts.push(
			heading(i18next.t('formatters.anti_raid_nuke.parameters.created.title', { lng: locale }), 4),
			list([
				i18next.t('formatters.anti_raid_nuke.parameters.created.after', {
					after: paramOrNone(args.created_after, locale),
					lng: locale,
				}),
				i18next.t('formatters.anti_raid_nuke.parameters.created.before', {
					before: paramOrNone(args.created_before, locale),
					lng: locale,
				}),
			]),
		);
	}

	if (typeof args.confusables === 'number') {
		parts.push(
			heading(
				i18next.t('formatters.anti_raid_nuke.parameters.confusables.title', { mode: args.confusables, lng: locale }),
				4,
			),
		);
	}

	parts.push(
		heading(
			i18next.t('formatters.anti_raid_nuke.parameters.days', {
				count: args.days,
				lng: locale,
			}),
			4,
		),
	);

	if (args.file) {
		parts.push(
			heading(
				i18next.t('formatters.anti_raid_nuke.parameters.file.title', {
					file: hyperlink(
						i18next.t('formatters.anti_raid_nuke.parameters.file.placeholder', {
							lng: locale,
						}),
						args.file.proxyURL,
					),
					lng: locale,
				}),
				4,
			),
		);
	}

	parts.push(emptyLine());

	const [nextCase] = await sql<[{ next_case: number }]>`select next_case(${guild.id});`;
	const from = nextCase.next_case - cases.length;
	const to = nextCase.next_case - 1;

	parts.push(heading(i18next.t('formatters.anti_raid_nuke.cases.title', { lng: locale }), 2));

	parts.push(
		list([
			cases.length
				? cases.length === 1
					? i18next.t('formatters.anti_raid_nuke.cases.single', { case_id: from, lng: locale })
					: i18next.t('formatters.anti_raid_nuke.cases.range', { from, to, lng: locale })
				: i18next.t('formatters.anti_raid_nuke.cases.none', { lng: locale }),
			args.logMessageUrl
				? i18next.t('formatters.anti_raid_nuke.cases.log_message', {
						link: hyperlink(
							i18next.t('formatters.anti_raid_nuke.cases.log_message_sub', { lng: locale }),
							args.logMessageUrl,
						),
						lng: locale,
				  })
				: i18next.t('formatters.anti_raid_nuke.cases.log_message_none', {
						lng: locale,
				  }),
		]),
	);

	const { successes, failures } = resultToTable(result, cases, args.dryRun);

	parts.push(
		emptyLine(),
		horizontalRule(),
		emptyLine(),
		heading(i18next.t('formatters.anti_raid_nuke.successes.title', { lng: locale }), 2),
	);

	if (successes.length) {
		parts.push(
			table(i18next.t('formatters.anti_raid_nuke.successes.tables', { returnObjects: true, lng: locale }), successes),
		);
	} else {
		parts.push(blockquote(heading(i18next.t('formatters.anti_raid_nuke.successes.none', { lng: locale }), 3)));
	}

	parts.push(
		emptyLine(),
		horizontalRule(),
		emptyLine(),
		heading(i18next.t('formatters.anti_raid_nuke.failures.title', { lng: locale }), 2),
	);

	if (failures.length) {
		parts.push(
			table(i18next.t('formatters.anti_raid_nuke.failures.tables', { lng: locale, returnObjects: true }), failures),
		);
	} else {
		parts.push(blockquote(heading(i18next.t('formatters.anti_raid_nuke.failures.none', { lng: locale }), 3)));
	}

	parts.push(
		emptyLine(),
		horizontalRule(),
		emptyLine(),
		heading(i18next.t('formatters.anti_raid_nuke.raw_data.title', { lng: locale }), 2),
		i18next.t('formatters.anti_raid_nuke.raw_data.description', { lng: locale }),
		emptyLine(),
		codeBlock('ansi', formatAntiRaidResultsToAttachment(result.sort(sortByResultMember), locale)),
	);

	return parts.join('\n');
}
