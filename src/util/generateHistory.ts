import { oneLine, stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
	ButtonInteraction,
	CommandInteraction,
	Formatters,
	GuildMember,
	SelectMenuInteraction,
	Snowflake,
	User,
} from 'discord.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';

dayjs.extend(relativeTime);

import type { RawCase } from '../functions/cases/transformCase';
import { getGuildSetting, SettingsKeys } from '../functions/settings/getGuildSetting';
import { kSQL } from '../tokens';
import { addFields, truncateEmbed } from './embed';
import { generateMessageLink } from './generateMessageLink';

const ACTION_KEYS = ['restriction', '', 'warn', 'kick', 'softban', 'ban', 'unban'];

interface CaseFooter {
	warn?: number;
	restriction?: number;
	mute?: number;
	kick?: number;
	ban?: number;
	[key: string]: number | undefined;
}

export async function generateHistory(
	interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction,
	target: { member?: GuildMember; user: User },
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const logChannelId: Snowflake = await getGuildSetting(interaction.guildId!, SettingsKeys.ModLogChannelId)!;

	const sinceCreationFormatted = Formatters.time(
		dayjs(target.user.createdTimestamp).unix(),
		Formatters.TimestampStyles.RelativeTime,
	);
	const creationFormatted = Formatters.time(
		dayjs(target.user.createdTimestamp).unix(),
		Formatters.TimestampStyles.ShortDateTime,
	);

	let embed = addFields(
		{
			author: {
				name: `${target.user.tag} (${target.user.id})`,
				icon_url: target.user.displayAvatarURL(),
			},
			title: 'Cases',
		},
		{
			name: 'User Details',
			value: stripIndents`
					• Username: \`${target.user.tag}\` (${target.user.id})
					• Created: ${creationFormatted} (${sinceCreationFormatted})
				`,
		},
	);

	if (target.member?.joinedTimestamp) {
		const sinceJoinFormatted = Formatters.time(
			dayjs(target.member.joinedTimestamp).unix(),
			Formatters.TimestampStyles.RelativeTime,
		);
		const joinFormatted = Formatters.time(
			dayjs(target.member.joinedTimestamp).unix(),
			Formatters.TimestampStyles.ShortDateTime,
		);

		embed = addFields(embed, {
			name: 'Member Details',
			value: stripIndents`
					${target.member.nickname ? `• Nickname: \`${target.member.nickname}\`` : '• No nickname'}
					• Roles: ${
						target.member.roles.cache.size
							? target.member.roles.cache.map((role) => role.toString()).join(', ')
							: 'No roles'
					}
					• Joined: ${joinFormatted} (${sinceJoinFormatted})
				`,
		});
	}

	const cases = await sql<[RawCase]>`
			select *
			from cases
			where guild_id = ${interaction.guildId}
				and target_id = ${target.user.id}
				and action not in (1)
			order by created_at desc`;

	const footer = cases.reduce((count: CaseFooter, c) => {
		const action = ACTION_KEYS[c.action];
		count[action] = (count[action] ?? 0) + 1;
		return count;
	}, {});
	const colors = [8319775, 8450847, 10870283, 13091073, 14917123, 16152591, 16667430, 16462404];
	const values = [
		footer.unban ?? 0,
		footer.warn ?? 0,
		footer.restriction ?? 0,
		footer.kick ?? 0,
		footer.softban ?? 0,
		footer.ban ?? 0,
	];
	const [unban, warn, restriction, kick, softban, ban] = values;
	const colorIndex = Math.min(
		values.reduce((a, b) => a + b),
		colors.length - 1,
	);

	embed = {
		color: colors[colorIndex],
		footer: {
			text: oneLine`${warn} warning${warn > 1 || warn === 0 ? 's' : ''},
					${restriction} restriction${restriction > 1 || restriction === 0 ? 's' : ''},
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
		const dateFormatted = Formatters.time(dayjs(c.created_at).unix(), Formatters.TimestampStyles.ShortDate);
		const caseString = `${dateFormatted} ${Formatters.inlineCode(`${ACTION_KEYS[c.action].toUpperCase()}`)} ${
			c.log_message_id
				? Formatters.hyperlink(`#${c.case_id}`, generateMessageLink(c.guild_id, logChannelId, c.log_message_id))
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
		embed = { description: `${summary.join('\n')}\nand more...`, ...embed };
	} else {
		embed = { description: summary.join('\n'), ...embed };
	}

	return truncateEmbed(embed);
}
