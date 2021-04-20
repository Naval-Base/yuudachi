import type { APIEmbed, APIGuildInteraction } from 'discord-api-types/v8';
import { inject, injectable } from 'tsyringe';
import { oneLine, stripIndents } from 'common-tags';
import type { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';
import { CommandModules } from '@yuudachi/types';
import type { ArgumentsOf, HistoryCommand } from '@yuudachi/interactions';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import Command from '../../Command';
import { DATE_FORMAT_DATE, DATE_FORMAT_WITH_SECONDS, DISCORD_EPOCH } from '../../Constants';
import { addFields, checkMod, send } from '../../util';

const { kSQL } = Tokens;

const ACTION_KEYS = ['restriction', '', 'warn', 'kick', 'softban', 'ban', 'unban'];

interface CaseFooter {
	warn?: number;
	restriction?: number;
	mute?: number;
	kick?: number;
	ban?: number;
	[key: string]: number | undefined;
}

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>) {}

	private parse(args: ArgumentsOf<typeof HistoryCommand>) {
		return args.user;
	}

	public async execute(
		message: APIGuildInteraction,
		args: ArgumentsOf<typeof HistoryCommand>,
		locale: string,
	): Promise<void> {
		await checkMod(message, locale);

		const member = this.parse(args);

		const createdTimestamp = Number((BigInt(member.user.id) >> 22n) + BigInt(DISCORD_EPOCH));
		const sinceCreationFormatted = dayjs(createdTimestamp).fromNow();
		const creationFormatted = dayjs(createdTimestamp).format(DATE_FORMAT_WITH_SECONDS);

		const avatar = member.user.avatar
			? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.${
					member.user.avatar.startsWith('_a') ? 'gif' : 'png'
			  }`
			: `https://cdn.discordapp.com/embed/avatars/${Number(member.user.discriminator) % 5}.png`;
		let embed: APIEmbed = addFields(
			{
				author: {
					name: `${member.user.username}#${member.user.discriminator} (${member.user.id})`,
					icon_url: avatar,
				},
			},
			{
				name: 'User Details',
				value: stripIndents`
					• Id: \`${member.user.id}\`
					• Username: \`${member.user.username}#${member.user.discriminator}\`
					• Created: \`${creationFormatted} (UTC)\` (${sinceCreationFormatted})
				`,
			},
		);

		if (member.joined_at) {
			const sinceJoinFormatted = dayjs(member.joined_at).fromNow();
			const joinFormatted = dayjs(member.joined_at).format(DATE_FORMAT_WITH_SECONDS);

			embed = addFields(embed, {
				name: 'Member Details',
				value: stripIndents`
					${member.nick ? `• Nickname: \`${member.nick}\`` : '• No nickname'}
					• Roles: ${member.roles.length ? member.roles.map((role) => `<@&${role}>`).join(', ') : 'No roles'}
					• Joined: \`${joinFormatted} (UTC)\` (${sinceJoinFormatted})
				`,
			});
		}

		const cases = await this.sql<[{ case_id: number; action: number; reason: string | null; created_at: Date }]>`
			select case_id, action, reason, created_at
			from cases
			where guild_id = ${message.guild_id}
				and target_id = ${member.user.id}
			order by created_at desc`;

		const footer = cases.reduce((count: CaseFooter, c) => {
			const action = ACTION_KEYS[c.action];
			count[action] = (count[action] ?? 0) + 1;
			return count;
		}, {});
		const colors = [8450847, 10870283, 13091073, 14917123, 16152591, 16667430, 16462404];
		const values = [footer.warn ?? 0, footer.restriction ?? 0, footer.kick ?? 0, footer.softban ?? 0, footer.ban ?? 0];
		const [warn, restriction, kick, softban, ban] = values;
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
					${softban} softban${softban > 1 || softban === 0 ? 's' : ''}
					and ${ban} ban${ban > 1 || ban === 0 ? 's' : ''}.`,
			},
			...embed,
		};

		const summary: string[] = [];
		let truncated = false;

		for (const c of cases) {
			const dateFormatted = dayjs(c.created_at).format(DATE_FORMAT_DATE);
			const caseString = `• \`${dateFormatted} ${ACTION_KEYS[c.action].toUpperCase()} #${c.case_id}\` ${
				c.reason?.replace(/`/g, '').replace(/\*/g, '') ?? ''
			}`;
			if (summary.join('\n').length + caseString.length + 1 < 2040) {
				summary.push(caseString);
				continue;
			}

			truncated = true;
			break;
		}
		if (truncated) {
			embed = { description: `${summary.join('\n')}\n• more...`, ...embed };
		} else {
			embed = { description: summary.join('\n'), ...embed };
		}

		void send(message, { embed });
	}
}
