import { stripIndents } from 'common-tags';
import { Command } from 'discord-akairo';
import { GuildMember, Message, Permissions, MessageAttachment } from 'discord.js';
import { MESSAGES, DATE_FORMAT_LOGFILE, DATE_FORMAT_WITH_SECONDS, COLORS } from '../../util/constants';
import * as moment from 'moment';
import { ms } from '@naval-base/ms';
import { EVENTS, TOPICS } from '../../util/logger';
import BanAction from '../../structures/case/actions/Ban';

export default class LaunchCybernukeCommand extends Command {
	public constructor() {
		super('cybernuke', {
			aliases: ['cybernuke', 'launch-cybernuke'],
			description: {
				content: MESSAGES.COMMANDS.UTIL.CYBERNUKE.DESCRIPTION,
				usage: '<join> <age> [--report] [--list] [--days=3] [--nsfw]',
				examples: ['10 120'],
			},
			category: 'util',
			channel: 'guild',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
			ratelimit: 2,
			args: [
				{
					id: 'join',
					type: (_, str): number | null => {
						if (!str) return null;
						const duration = ms(str);
						if (isNaN(duration)) return null;
						if (duration < 6000) return null;
						if (duration > 120 * 60 * 1000) return null;
						return duration;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.JOIN.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.JOIN.RETRY(message.author),
					},
				},
				{
					id: 'age',
					type: (_, str): number | null => {
						if (!str) return null;
						const duration = ms(str);
						if (isNaN(duration)) return null;
						if (duration < 6000) return null;
						return duration;
					},
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.AGE.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.AGE.RETRY(message.author),
					},
				},
				{
					id: 'report',
					match: 'flag',
					flag: ['--report', '-r'],
				},
				{
					id: 'list',
					match: 'flag',
					flag: ['--list', '-ls', '-l'],
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days=', '-d='],
					default: 1,
				},
				{
					id: 'nsfw',
					match: 'flag',
					flag: ['--nsfw'],
				},
			],
		});
	}

	public async exec(
		message: Message,
		{
			join,
			age,
			report,
			days,
			list,
			nsfw,
		}: { join: number; age: number; report: boolean; days: number; list: boolean; nsfw: boolean },
	) {
		days = Math.min(Math.max(days, 0), 7);

		const guild = message.guild!;
		message.channel.startTyping();
		const fetchedMembers = await guild.members.fetch();

		const joinCutoff = Date.now() - join;
		const ageCutoff = Date.now() - age;

		const nowFormatted = moment.utc().format(DATE_FORMAT_WITH_SECONDS);
		const joinCutoffFormatted = moment.utc(joinCutoff).format(DATE_FORMAT_WITH_SECONDS);
		const ageCutoffFormatted = moment.utc(ageCutoff).format(DATE_FORMAT_WITH_SECONDS);

		const members = fetchedMembers.filter(
			(member) => (member.joinedTimestamp ?? 0) > joinCutoff && member.user.createdTimestamp > ageCutoff,
		);

		message.channel.stopTyping();
		if (!members.size) {
			return message.channel.send(
				`${MESSAGES.COMMANDS.UTIL.CYBERNUKE.FAIL.NO_MEMBERS}\n${MESSAGES.COMMANDS.UTIL.CYBERNUKE.PARAMETERS(
					`\`${nowFormatted} (UTC)\``,
					`\`${joinCutoffFormatted} (UTC)\``,
					`\`${ageCutoffFormatted} (UTC)\``,
				)}`,
			);
		}

		if (list) {
			await message.channel.send(
				`${MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.CONFIRMATION(
					message.author,
					members.size,
				)}\n${MESSAGES.COMMANDS.UTIL.CYBERNUKE.PARAMETERS(
					`\`${nowFormatted} (UTC)\``,
					`\`${joinCutoffFormatted} (UTC)\``,
					`\`${ageCutoffFormatted} (UTC)\``,
				)}\n• Projected targets:\n${members.map((m) => `\`${m.user.tag}\``).join(', ')}`,
				{
					split: true,
				},
			);
		} else {
			await message.util?.send(
				`${MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.CONFIRMATION(
					message.author,
					members.size,
				)}\n${MESSAGES.COMMANDS.UTIL.CYBERNUKE.PARAMETERS(
					`\`${nowFormatted} (UTC)\``,
					`\`${joinCutoffFormatted} (UTC)\``,
					`\`${ageCutoffFormatted} (UTC)\``,
				)}`,
			);
		}

		const filter = (m: Message) =>
			m.author.id === message.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());

		try {
			const collected = await message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first()!.content)) {
				const statusMessage = await message?.channel.send('Launching cybernuke...');

				const fatalities: GuildMember[] = [];
				const survivors: { member: GuildMember; error: Error }[] = [];
				const promises: Promise<Message | void>[] = [];

				message.channel.startTyping();

				let i = 0;
				for (const member of members.values()) {
					promises.push(
						member
							.send(
								stripIndents`
									You have been banned from \`${guild.name}\` as part of anti raid measures.
									Please contact \`Crawl#0002\`, explaining the situation if you believe this to be an error.
								`,
							)
							.catch((error: any) => {
								this.client.logger.error(error, { topic: TOPICS.DISCORD, event: EVENTS.COMMAND_ERROR });
							})
							.then(async () => {
								const key = `${guild.id}:${member.id}:BAN`;
								await guild.caseQueue.add(async () => {
									new BanAction({
										message,
										member,
										keys: key,
										reason: `Cybernuke \`(${++i}/${members.size})\``,
										days,
										nsfw,
										skipPrompt: true,
										skipResponse: true,
										overrideColor: COLORS.ANTIRAID,
									}).commit();
								});
							})
							.then(() => {
								fatalities.push(member);
							})
							.catch((err: any) => {
								this.client.logger.error(err, { topic: TOPICS.DISCORD, event: EVENTS.COMMAND_ERROR });
								survivors.push({
									member,
									error: err,
								});
							})
							.then(async () => {
								if (members.size <= 5) return;
								if (promises.length % 5 === 0) {
									await statusMessage?.edit(
										`Launching cyber nuke (${Math.round((promises.length / members.size) * 100)}%)...`,
									);
								}
							}),
					);
				}

				await Promise.all(promises);
				await statusMessage?.edit('Cybernuke impact confirmed. Casualty report incoming...');
				const parts: string[] = [];

				if (fatalities.length) {
					parts.push(`__Fatalities (${fatalities.length})__`);
					parts.push(fatalities.map((fat) => `• \`${fat.user.tag}\` (${fat.id})`).join('\n'));
				}

				if (survivors.length) {
					parts.push(`__Survivors (${survivors.length})__`);
					parts.push(
						survivors.map((srv) => `•  \`${srv.member.user.tag}\` (${srv.member.id}) \`${srv.error}\``).join('\n'),
					);
				}
				await message.channel.send(parts.join('\n'), { split: true });

				if (report) {
					const buffer = Buffer.from(fatalities.map((u) => u.id).join('\r\n'));
					const d = moment.utc().format(DATE_FORMAT_LOGFILE);
					const attachment = new MessageAttachment(buffer, `${d} cybernuke-report.txt`);

					await message.channel.send(MESSAGES.COMMANDS.UTIL.CYBERNUKE.REPORT, [attachment]);
				}

				return null;
			}

			return message.channel.send(MESSAGES.COMMANDS.UTIL.CYBERNUKE.FAIL.CONFIRMATION);
		} catch {
			message.channel.send(MESSAGES.COMMANDS.UTIL.CYBERNUKE.FAIL.TIMEOUT);
		} finally {
			message.channel.stopTyping();
		}

		return null;
	}
}
