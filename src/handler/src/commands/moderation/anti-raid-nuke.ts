import type { APIGuildMember, APIGuildInteraction } from 'discord-api-types/v8';
import API from '@yuudachi/api';
import { CaseAction, CommandModules } from '@yuudachi/types';
import type { AntiRaidNuke, ArgumentsOf } from '@yuudachi/interactions';
import i18next from 'i18next';
import { injectable } from 'tsyringe';
import ms from '@naval-base/ms';
import dayjs from 'dayjs';

import Command from '../../Command';
import { checkMod, fetchMembers, send } from '../../util';
import { DATE_FORMAT_LOGFILE, DATE_FORMAT_WITH_SECONDS, DISCORD_EPOCH } from '../../Constants';

@injectable()
export default class implements Command {
	public readonly category = CommandModules.Moderation;

	public constructor(private readonly api: API) {}

	private parse(args: ArgumentsOf<typeof AntiRaidNuke>) {
		return {
			join: args.join,
			age: args.age,
			report: args.report,
			list: args.list,
			noDry: args['no-dry-run'],
			days: args.days,
		};
	}

	public async execute(
		message: APIGuildInteraction,
		args: ArgumentsOf<typeof AntiRaidNuke>,
		locale: string,
	): Promise<void> {
		await checkMod(message, locale);

		const { join, age, report, noDry, days } = this.parse(args);
		const parsedJoin = ms(join);
		if (parsedJoin < 6000 || parsedJoin > 120 * 60 * 1000 || isNaN(parsedJoin)) {
			throw new Error(i18next.t('command.common.errors.duration_format', { lng: locale }));
		}

		const parsedAge = ms(age);
		if (parsedAge < 6000 || isNaN(parsedAge)) {
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
				Number((BigInt(member.user!.id) >> 22n) + BigInt(DISCORD_EPOCH)) > ageCutoff,
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
						moderatorId: message.member.user.id,
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
