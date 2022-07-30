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
} from 'discord.js';
import i18next from 'i18next';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { ACTION_KEYS } from './actionKeys.js';
import { addFields, truncateEmbed } from './embed.js';
import { generateMessageLink } from './generateMessageLink.js';
import type { RawCase } from '../functions/cases/transformCase.js';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting.js';
import { kSQL } from '../tokens.js';

dayjs.extend(relativeTime);

interface CaseFooter {
	warn?: number;
	restriction?: number;
	mute?: number;
	kick?: number;
	ban?: number;
	timeout?: number;
	[key: string]: number | undefined;
}

export async function generateHistory(
	interaction: CommandInteraction<'cached'> | ButtonInteraction<'cached'> | SelectMenuInteraction<'cached'>,
	target: { member?: GuildMember; user: User },
	locale: string,
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const modLogChannelId = await getGuildSetting(interaction.guildId, SettingsKeys.ModLogChannelId);

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
				userMention: target.user.toString(),
				userTag: target.user.tag,
				userId: target.user.id,
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
				memberNickname: target.member.nickname ?? i18next.t('log.history.member_details_no_nickname', { lng: locale }),
				memberRoles: target.member.roles.cache.map((role) => role.name).join(', '),
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
			order by created_at desc`;

	const footer = cases.reduce((count: CaseFooter, c) => {
		const action = ACTION_KEYS[c.action]!;
		count[action] = (count[action] ?? 0) + 1;
		return count;
	}, {});
	const colors = [8319775, 8450847, 10870283, 13091073, 14917123, 16152591, 16667430, 16462404];
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

	for (const c of cases) {
		const dateFormatted = time(dayjs(c.created_at).unix(), TimestampStyles.ShortDate);
		const caseString = `${dateFormatted} ${inlineCode(`${ACTION_KEYS[c.action]!.toUpperCase()}`)} ${
			c.log_message_id
				? hyperlink(`#${c.case_id}`, generateMessageLink(c.guild_id, modLogChannelId, c.log_message_id))
				: `#${c.case_id}`
		} ${c.reason?.replace(/\*/g, '') ?? ''}`;
		if (summary.join('\n').length + caseString.length + 1 < 4060) {
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
