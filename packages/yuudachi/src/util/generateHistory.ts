import { oneLine } from 'common-tags';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import {
	type CommandInteraction,
	type ButtonInteraction,
	type GuildMember,
	type SelectMenuInteraction,
	type User,
	hyperlink,
	inlineCode,
	time,
	TimestampStyles,
	messageLink,
} from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { ThreatLevelColor } from '../Constants.js';
import type { RawCase } from '../functions/cases/transformCase.js';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting.js';
import { kSQL } from '../tokens.js';
import { ACTION_KEYS } from './actionKeys.js';
import { addFields, truncateEmbed } from './embed.js';

dayjs.extend(relativeTime);

type CaseFooter = {
	[key: string]: number | undefined;
	ban?: number | undefined;
	kick?: number | undefined;
	mute?: number | undefined;
	restriction?: number | undefined;
	timeout?: number | undefined;
	warn?: number | undefined;
};

export async function generateHistory(
	interaction: ButtonInteraction<'cached'> | CommandInteraction<'cached'> | SelectMenuInteraction<'cached'>,
	target: { member?: GuildMember | undefined; user: User },
	locale: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const moduleLogChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId);

	const sinceCreationFormatted = time(dayjs(target.user.createdTimestamp).unix(), TimestampStyles.RelativeTime);
	const creationFormatted = time(dayjs(target.user.createdTimestamp).unix(), TimestampStyles.ShortDateTime);

	let embed = addFields(
		{
			author: {
				name: `${target.user.tag} (${target.user.id})`,
				icon_url: target.user.displayAvatarURL(),
			},
			title: i18next.t('log.history.title', { lng: locale }),
		},
		{
			name: i18next.t('log.history.user_details', { lng: locale }),
			value: i18next.t('log.history.user_details_description', {
				user_mention: target.user.toString(),
				user_tag: target.user.tag,
				user_id: target.user.id,
				created_at: creationFormatted,
				created_at_since: sinceCreationFormatted,
				lng: locale,
			}),
		},
	);

	if (target.member?.joinedTimestamp) {
		const sinceJoinFormatted = time(dayjs(target.member.joinedTimestamp).unix(), TimestampStyles.RelativeTime);
		const joinFormatted = time(dayjs(target.member.joinedTimestamp).unix(), TimestampStyles.ShortDateTime);

		embed = addFields(embed, {
			name: i18next.t('log.history.member_details', { lng: locale }),
			value: i18next.t('log.history.member_details_description', {
				member_nickname: target.member.nickname ?? i18next.t('log.history.member_details_no_nickname', { lng: locale }),
				member_roles: target.member.roles.cache.map((role) => role.name).join(', '),
				joined_at: joinFormatted,
				joined_at_since: sinceJoinFormatted,
				lng: locale,
			}),
		});
	}

	const cases = await sql<[RawCase]>`
		select *
		from cases
		where guild_id = ${interaction.guildId}
			and target_id = ${target.user.id}
			and action not in (1, 8)
		order by created_at desc
	`;

	// eslint-disable-next-line unicorn/no-array-reduce
	const footer = cases.reduce((count: CaseFooter, case_) => {
		const action = ACTION_KEYS[case_.action]!;
		count[action] = (count[action] ?? 0) + 1;
		return count;
	}, {});
	const colors = [
		ThreatLevelColor.Level0,
		ThreatLevelColor.Level1,
		ThreatLevelColor.Level2,
		ThreatLevelColor.Level3,
		ThreatLevelColor.Level4,
		ThreatLevelColor.Level5,
		ThreatLevelColor.Level6,
		ThreatLevelColor.Level7,
	];
	const values: [number, number, number, number, number, number, number] = [
		footer.unban ?? 0,
		footer.warn ?? 0,
		footer.restriction ?? 0,
		footer.kick ?? 0,
		footer.softban ?? 0,
		footer.ban ?? 0,
		footer.timeout ?? 0,
	];
	const [unban, warn, restriction, kick, softban, ban, timeout] = values;
	const colorIndex = Math.min(
		values.reduce((a, b) => a + b),
		colors.length - 1,
	);

	embed = {
		color: colors[colorIndex],
		footer: {
			text: oneLine`${warn} warning${warn > 1 || warn === 0 ? 's' : ''},
					${restriction} restriction${restriction > 1 || restriction === 0 ? 's' : ''},
					${timeout} timeout${timeout > 1 || timeout === 0 ? 's' : ''},
					${kick} kick${kick > 1 || kick === 0 ? 's' : ''},
					${softban} softban${softban > 1 || softban === 0 ? 's' : ''},
					${ban} ban${ban > 1 || ban === 0 ? 's' : ''},
					${unban} unban${unban > 1 || unban === 0 ? 's' : ''}`,
		},
		...embed,
	};

	const summary: string[] = [];
	let truncated = false;

	for (const case_ of cases) {
		const dateFormatted = time(dayjs(case_.created_at).unix(), TimestampStyles.ShortDate);
		const caseString = `${dateFormatted} ${inlineCode(`${ACTION_KEYS[case_.action]!.toUpperCase()}`)} ${
			case_.log_message_id
				? hyperlink(`#${case_.case_id}`, messageLink(moduleLogChannelId, case_.log_message_id, case_.guild_id))
				: `#${case_.case_id}`
		} ${case_.reason?.replace(/\*/g, '') ?? ''}`;

		if (summary.join('\n').length + caseString.length + 1 < 4_060) {
			summary.push(caseString);
			continue;
		}

		truncated = true;
		break;
	}

	if (truncated) {
		embed = {
			description: i18next.t('log.history.summary_truncated', { summary: summary.join('\n'), lng: locale }),
			...embed,
		};
	} else {
		embed = { description: summary.join('\n'), ...embed };
	}

	return truncateEmbed(embed);
}
