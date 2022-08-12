import dayjs from 'dayjs';
import type { Collection, GuildMember, Snowflake } from 'discord.js';
import i18next from 'i18next';
import { DATE_FORMAT_WITH_SECONDS } from '../../Constants.js';
import { colorBasedOnBoolean, colorBasedOnDifference } from '../../util/colors.js';
import type { AntiRaidNukeResult } from '../anti-raid/blastOff.js';

export function formatMemberSummary(member: GuildMember, locale: string, success = true) {
	const memberAge = Date.now() - member.user.createdTimestamp;
	const joinAge = Date.now() - member.joinedTimestamp!;

	return i18next.t('formatters.formatting.guild_member', {
		id: colorBasedOnBoolean(success, member.user.id.padEnd(19, ' ')),
		join: colorBasedOnDifference(joinAge, dayjs(member.joinedTimestamp).format(DATE_FORMAT_WITH_SECONDS)),
		creation: colorBasedOnDifference(memberAge, dayjs(member.user.createdTimestamp).format(DATE_FORMAT_WITH_SECONDS)),
		tag: member.user.tag,
		lng: locale,
	});
}

export function formatMembersToAttachment(members: Collection<Snowflake, GuildMember>, locale: string) {
	return members.map((member) => formatMemberSummary(member, locale)).join('\n');
}

export function formatAntiRaidResultSummary(report: AntiRaidNukeResult, locale: string) {
	return formatMemberSummary(report.member, locale, report.success);
}

export function formatAntiRaidResultsToAttachment(results: AntiRaidNukeResult[], locale: string) {
	return results.map((result) => formatAntiRaidResultSummary(result, locale)).join('\n');
}
