import { ms } from '@naval-base/ms';
import dayjs from 'dayjs';
import { type Guild, hyperlink, type User, type Snowflake, type Attachment, GuildMember } from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { blockquote, checkbox, emptyLine, heading, horizontalRule, list, table } from './markdownUtils.js';
import type { ArgsParam } from '../../Command.js';
import { DATE_FORMAT_WITH_SECONDS } from '../../Constants.js';
import type { AntiRaidNukeMode } from '../../commands/moderation/sub/anti-raid-nuke/coreCommand.js';
import { Confusables } from '../../commands/moderation/sub/anti-raid-nuke/filter.js';
import type { TargetRejection } from '../../commands/moderation/sub/anti-raid-nuke/utils.js';
import type { AntiRaidNukeCommand } from '../../interactions/index.js';
import { kSQL } from '../../tokens.js';
import type { Case } from '../cases/createCase.js';
import { getGuildSetting, SettingsKeys } from '../settings/getGuildSetting.js';

export type AntiRaidNukeArgsUnion = ArgsParam<typeof AntiRaidNukeCommand>['file'] &
	ArgsParam<typeof AntiRaidNukeCommand>['filter'] &
	ArgsParam<typeof AntiRaidNukeCommand>['modal'];

export type FormatterArgs = Omit<AntiRaidNukeArgsUnion, 'file'> & {
	file?: Attachment | undefined;
	mode: AntiRaidNukeMode;
	timeTaken: number;
	preliminary: boolean;
	logMessageUrl?: string;
};

function findCase(userId: Snowflake, cases: Case[]) {
	return cases.find((case_) => case_.targetId === userId)!;
}

function successTableRows(members: GuildMember[], cases: Case[], preliminary: boolean, locale: string) {
	return members.map((member) => [
		preliminary
			? i18next.t('formatters.anti_raid_nuke.case_placeholder', { lng: locale })
			: findCase(member.id, cases).caseId.toString(),
		member.id,
		member.user.tag,
	]);
}

function failTableRows(rejections: TargetRejection[]) {
	return rejections.map((rejection) => [rejection.member.id, rejection.member.user.tag, rejection.reason]);
}

function paramOrNone(param: string | undefined, locale: string): string {
	return param ?? i18next.t('formatters.anti_raid_nuke.parameters.none', { lng: locale });
}

export async function generateAntiRaidNukeReport(
	guild: Guild,
	executor: User,
	successes: GuildMember[],
	failures: TargetRejection[],
	cases: Case[],
	args: FormatterArgs,
) {
	const sql = container.resolve<Sql<any>>(kSQL);
	const locale = await getGuildSetting(guild.id, SettingsKeys.Locale);
	const isPreliminary = Boolean(args.preliminary || args.hide);

	const parts = [
		heading(
			args.preliminary
				? i18next.t('formatters.anti_raid_nuke.title_preliminary', { guild: guild.name, lng: locale })
				: i18next.t('formatters.anti_raid_nuke.title', { guild: guild.name, lng: locale }),
			1,
		),
		heading(i18next.t('formatters.anti_raid_nuke.summary.title', { lng: locale }), 2),
	];

	if (args.hide) {
		parts.push(
			blockquote('**Note**'),
			blockquote(
				i18next.t(`formatters.anti_raid_nuke.summary.preliminary_hidden`, {
					lng: locale,
				}),
			),
		);
	} else if (args.preliminary) {
		parts.push(
			blockquote('**Warning**'),
			blockquote(
				i18next.t(`formatters.anti_raid_nuke.summary.preliminary`, {
					lng: locale,
				}),
			),
		);
	}

	if (!isPreliminary) {
		parts.push(
			list([
				i18next.t('formatters.anti_raid_nuke.summary.mode', { mode: args.mode, lng: locale }),
				i18next.t('formatters.anti_raid_nuke.summary.launch_time', {
					launch_time: dayjs().format(DATE_FORMAT_WITH_SECONDS),
					lng: locale,
				}),
				i18next.t('formatters.anti_raid_nuke.summary.time_taken', {
					time_taken: ms(Number(args.timeTaken.toFixed(2))),
					lng: locale,
				}),
				i18next.t('formatters.anti_raid_nuke.summary.moderator', {
					moderator: `${executor.tag} (${executor.id})`,
					lng: locale,
				}),
				i18next.t('formatters.anti_raid_nuke.summary.reason', {
					reason: paramOrNone(args.reason, locale),
					lng: locale,
				}),
			]),
			emptyLine(),
		);
	}

	const totalResults = successes.length + failures.length;
	const ratio = `${Math.round((successes.length / totalResults) * 100)}%`;

	parts.push(
		heading(i18next.t('formatters.anti_raid_nuke.results.title', { lng: locale }), 2),
		i18next.t('formatters.anti_raid_nuke.results.total', { count: totalResults, lng: locale }),
		list([
			isPreliminary
				? i18next.t('formatters.anti_raid_nuke.results.preliminary.banned', {
						count: successes.length,
						lng: locale,
				  })
				: i18next.t('formatters.anti_raid_nuke.results.blast.banned', {
						count: successes.length,
						lng: locale,
				  }),
			isPreliminary
				? i18next.t('formatters.anti_raid_nuke.results.preliminary.failed', {
						count: failures.length,
						lng: locale,
				  })
				: i18next.t('formatters.anti_raid_nuke.results.blast.failed', {
						count: failures.length,
						lng: locale,
				  }),
		]),
		emptyLine(),
		i18next.t('formatters.anti_raid_nuke.results.ratio', {
			ratio,
			lng: locale,
		}),
		emptyLine(),
	);

	parts.push(heading(i18next.t('formatters.anti_raid_nuke.parameters.title', { lng: locale }), 2));

	if (args.avatar) {
		parts.push(
			heading(i18next.t('formatters.anti_raid_nuke.parameters.avatar', { avatar: args.avatar, lng: locale }), 4),
		);
	}

	if (args.pattern) {
		const confusables =
			args.confusables === Confusables.OnlyPattern || args.confusables === Confusables.PatternAndMembers;
		parts.push(
			heading(
				i18next.t('formatters.anti_raid_nuke.parameters.pattern.title', { pattern: args.pattern, lng: locale }),
				4,
			),
		);

		if (confusables) {
			parts.push(
				checkbox(
					i18next.t('formatters.anti_raid_nuke.parameters.pattern.confusables', {
						mode: args.confusables,
						lng: locale,
					}),
					true,
				),
			);
		}

		parts.push(
			checkbox(
				i18next.t('formatters.anti_raid_nuke.parameters.pattern.insensitive', { lng: locale }),
				args.insensitive,
			),
			checkbox(i18next.t('formatters.anti_raid_nuke.parameters.pattern.full_match', { lng: locale }), args.full_match),
		);
	}

	if (
		args.confusables === Confusables.Off ||
		args.confusables === Confusables.OnlyMembers ||
		args.confusables === Confusables.PatternAndMembers
	) {
		parts.push(
			heading(
				i18next.t('formatters.anti_raid_nuke.parameters.confusables.title', { mode: args.confusables, lng: locale }),
				4,
			),
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

	if (!isPreliminary) {
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
	}

	parts.push(
		emptyLine(),
		horizontalRule(),
		emptyLine(),
		heading(
			isPreliminary
				? i18next.t('formatters.anti_raid_nuke.preliminary.successes.title', { lng: locale })
				: i18next.t('formatters.anti_raid_nuke.blast.successes.title', { lng: locale }),
			2,
		),
	);

	if (successes.length) {
		parts.push(
			table(
				i18next.t('formatters.anti_raid_nuke.table.success_titles', { returnObjects: true, lng: locale }),
				successTableRows(successes, cases, isPreliminary, locale),
			),
		);
	} else {
		parts.push(
			blockquote(`**Warning**`),
			blockquote(
				isPreliminary
					? i18next.t('formatters.anti_raid_nuke.preliminary.successes.none', { lng: locale })
					: i18next.t('formatters.anti_raid_nuke.blast.successes.none', { lng: locale }),
			),
		);
	}

	parts.push(
		emptyLine(),
		horizontalRule(),
		emptyLine(),
		heading(
			isPreliminary
				? i18next.t('formatters.anti_raid_nuke.preliminary.fails.title', { lng: locale })
				: i18next.t('formatters.anti_raid_nuke.blast.fails.title', { lng: locale }),
			2,
		),
	);

	if (failures.length) {
		parts.push(
			table(
				i18next.t('formatters.anti_raid_nuke.table.fail_titles', { lng: locale, returnObjects: true }),
				failTableRows(failures),
			),
		);
	} else {
		parts.push(
			blockquote(`**Note**`),
			blockquote(
				isPreliminary
					? i18next.t('formatters.anti_raid_nuke.preliminary.fails.none', { lng: locale })
					: i18next.t('formatters.anti_raid_nuke.blast.fails.none', { lng: locale }),
			),
		);
	}

	return parts.join('\n');
}
