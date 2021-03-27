import { APIGuildMember, APIInteraction, APIMessage } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import { CaseAction, CommandModules } from '@yuudachi/types';
import i18next from 'i18next';
import { Args } from 'lexure';
import { inject, injectable } from 'tsyringe';
import type { Sql } from 'postgres';
import { Tokens } from '@yuudachi/core';
import ms from '@naval-base/ms';
import dayjs from 'dayjs';

import Command from '../../Command';
import { fetchMembers, send } from '../../util';
import { DATE_FORMAT_LOGFILE, DATE_FORMAT_WITH_SECONDS, DISCORD_EPOCH } from '../../Constants';

const { kSQL } = Tokens;

@injectable()
export default class implements Command {
	public readonly aliases = ['arn', 'nuke'];
	public readonly category = CommandModules.Moderation;

	public constructor(@inject(kSQL) private readonly sql: Sql<any>, private readonly api: API) {}

	private parse(args: Args) {
		const join = args.option('join');
		const age = args.option('age');
		const report = args.flag('report');
		const list = args.flag('list');
		const noDry = args.flag('no-dry-run', 'no-dry');
		const days = args.option('days', 'd');

		return {
			join: join ?? args.single(),
			age: age ?? args.single(),
			report,
			list,
			noDry,
			days,
		};
	}

	public async execute(message: APIMessage | APIInteraction, args: Args, locale: string): Promise<void> {
		if (!message.guild_id) {
			throw new Error(i18next.t('command.common.errors.no_guild', { lng: locale }));
		}

		const [data] = await this.sql<[{ mod_role_id: `${bigint}` | null }?]>`
			select mod_role_id
			from guild_settings
			where guild_id = ${message.guild_id}`;

		if (!message.member?.roles.includes(data?.mod_role_id ?? ('' as `${bigint}`))) {
			throw new Error(i18next.t('command.common.errors.no_mod_role', { lng: locale }));
		}

		const { join, age, report, noDry, days } = this.parse(args);
		let parsedJoin;
		let parsedAge;
		if (join) {
			parsedJoin = ms(join);
			if (parsedJoin < 6000 || parsedJoin > 120 * 60 * 1000 || isNaN(parsedJoin)) {
				throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
			}
		} else {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		if (age) {
			parsedAge = ms(age);
			if (parsedAge < 6000 || isNaN(parsedAge)) {
				throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
			}
		} else {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const joinCutoff = Date.now() - parsedJoin;
		const ageCutoff = Date.now() - parsedAge;

		const nowFormatted = dayjs().format(DATE_FORMAT_WITH_SECONDS);
		const joinCutoffFormatted = dayjs(joinCutoff).format(DATE_FORMAT_WITH_SECONDS);
		const ageCutoffFormatted = dayjs(ageCutoff).format(DATE_FORMAT_WITH_SECONDS);

		const fetchedMembers = await fetchMembers(message);
		const members = fetchedMembers.filter(
			(member) =>
				dayjs(member.joined_at).valueOf() > joinCutoff &&
				Number((BigInt(member.user!.id) >> BigInt(22)) + BigInt(DISCORD_EPOCH)) > ageCutoff,
		);

		if (!members.length) {
			return void send(message, {
				content: `${i18next.t('command.mod.anti_raid_nuke.errors.no_hits', {
					lng: locale,
				})}\n\n${i18next.t('command.mod.anti_raid_nuke.errors.parameters', {
					now: nowFormatted,
					join: joinCutoffFormatted,
					age: ageCutoffFormatted,
					lng: locale,
				})}`,
			});
		}

		if (!noDry) {
			return void send(message, {
				content: `${i18next.t('command.mod.anti_raid_nuke.dry_run', {
					members: members.length,
					lng: locale,
				})}\n\n${i18next.t('command.mod.anti_raid_nuke.errors.parameters', {
					now: nowFormatted,
					join: joinCutoffFormatted,
					age: ageCutoffFormatted,
					lng: locale,
				})}`,
			});
		}

		let idx = 0;
		const promises = [];
		const fatalities: APIGuildMember[] = [];
		const survivors: APIGuildMember[] = [];
		for (const member of members) {
			promises.push(
				this.api.guilds
					.createCase(message.guild_id, {
						action: CaseAction.BAN,
						reason: `Anti-raid-nuke \`(${++idx}/${members.length})\``,
						moderatorId: 'author' in message ? message.author.id : message.member.user.id,
						targetId: member.user!.id,
						contextMessageId: message.id,
						deleteMessageDays: days ? Math.min(Math.max(Number(days), 0), 7) : 0,
					})
					.then(() => {
						fatalities.push(member);
					})
					.catch(() => {
						survivors.push(member);
					}),
			);
		}

		await Promise.all(promises);

		if (report) {
			const buffer = Buffer.from(fatalities.map((member) => member.user!.id).join('\r\n'));
			const d = dayjs().format(DATE_FORMAT_LOGFILE);

			void send(message, {}, { files: [{ name: `${d}-anti-raid-nuke-report.txt`, file: buffer }] });
		}
	}
}
