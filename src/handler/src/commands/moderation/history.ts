import { APIEmbed, APIGuildMember, APIMessage, APIUser } from 'discord-api-types/v6';
import Rest from '@yuudachi/rest';
import i18next from 'i18next';
import { Args } from 'lexure';
import { inject, injectable } from 'tsyringe';
import { DateTime } from 'luxon';
import { oneLine, stripIndents } from 'common-tags';
import { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';

import Command from '../../Command';
import parseMember from '../../parsers/member';
import { CommandModules, DATE_FORMAT_DATE, DATE_FORMAT_WITH_SECONDS, DISCORD_EPOCH } from '../../Constants';
import { addFields } from '../../util';

const { kSQL } = Tokens;

const ACTION_KEYS = ['', 'restriction', '', 'warn', 'kick', 'softban', 'ban', 'unban'];

interface Footer {
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
	public readonly aliases = ['user'];

	public constructor(private readonly rest: Rest, @inject(kSQL) private readonly sql: Sql<any>) {}

	public async execute(message: APIMessage, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const maybeMember = args.singleParse(parseMember);
		if (!maybeMember) {
			throw new Error(i18next.t('command.common.errors.no_user_id', { lng: locale }));
		}
		if (!maybeMember.success) {
			throw new Error(i18next.t('command.common.errors.invalid_user_id', { lng: locale, id: maybeMember.error }));
		}

		const [targetUser, targetMember] = await Promise.allSettled([
			this.rest.get<APIUser>(`/users/${maybeMember.value}`),
			this.rest.get<APIGuildMember>(`/guilds/${message.guild_id}/members/${maybeMember.value}`),
		]);
		if (targetUser.status === 'rejected') {
			throw new Error(i18next.t('command.common.errors.no_user_found', { lng: locale }));
		}

		const createdTimestamp = Number((BigInt(targetUser.value.id) >> BigInt(22)) + BigInt(DISCORD_EPOCH));
		const sinceCreationFormatted = DateTime.fromMillis(createdTimestamp, { zone: 'utc' }).toRelative();
		const creationFormatted = DateTime.fromMillis(createdTimestamp, { zone: 'utc' }).toFormat(DATE_FORMAT_WITH_SECONDS);

		const avatar = targetUser.value.avatar
			? `https://cdn.discordapp.com/avatars/${targetUser.value.id}/${targetUser.value.avatar}.${
					targetUser.value.avatar.startsWith('_a') ? 'gif' : 'png'
			  }`
			: `https://cdn.discordapp.com/embed/avatars/${Number(targetUser.value.discriminator) % 5}.png`;
		let embed: APIEmbed = addFields(
			{
				author: {
					name: `${targetUser.value.username}#${targetUser.value.discriminator} (${targetUser.value.id})`,
					icon_url: avatar,
				},
			},
			{
				name: 'User Details',
				value: stripIndents`
					• Id: \`${targetUser.value.id}\`
					• Username: \`${targetUser.value.username}#${targetUser.value.discriminator}\`
					• Created: \`${creationFormatted} (UTC)\` (${sinceCreationFormatted})
				`,
			},
		);

		if (targetMember.status === 'fulfilled') {
			const sinceJoinFormatted = DateTime.fromISO(targetMember.value.joined_at, { zone: 'utc' }).toRelative();
			const joinFormatted = DateTime.fromISO(targetMember.value.joined_at, { zone: 'utc' }).toFormat(
				DATE_FORMAT_WITH_SECONDS,
			);

			embed = addFields(embed, {
				name: 'Member Details',
				value: stripIndents`
						${targetMember.value.nick ? `• Nickname: \`${targetMember.value.nick}\`` : '• No nickname'}
						• Roles: ${targetMember.value.roles.map((role) => `<@&${role}>`)}
						• Joined: \`${joinFormatted} (UTC)\` (${sinceJoinFormatted})
					`,
			});
		}

		const cases = await this.sql<{ case_id: number; action: number; reason: string; created_at: Date }>`
			select case_id, action, reason, created_at
			from cases
			where target_id = ${targetUser.value.id}
			order by created_at desc`;

		const footer = cases.reduce((count: Footer, c) => {
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
			const dateFormatted = DateTime.fromJSDate(c.created_at, { zone: 'utc' }).toFormat(DATE_FORMAT_DATE);
			const caseString = `• \`${dateFormatted} ${ACTION_KEYS[c.action].toUpperCase()} #${
				c.case_id
			}\` ${c.reason.replace(/`/g, '').replace(/\*/g, '')}`;
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

		void this.rest.post(`/channels/${message.channel_id}/messages`, { embed });
	}
}
