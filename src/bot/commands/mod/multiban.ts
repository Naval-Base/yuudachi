import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message, Permissions, Collection, MessageAttachment, User } from 'discord.js';
import { COLORS, DATE_FORMAT_LOGFILE, MESSAGES } from '../../util/constants';
import { EVENTS, TOPICS } from '../../util/logger';
import * as moment from 'moment';
import BanAction from '../../structures/case/actions/Ban';

export default class MultiBanCommand extends Command {
	public constructor() {
		super('multiban', {
			aliases: ['multiban', 'massban', 'nuke'],
			description: {
				content: MESSAGES.COMMANDS.MOD.MULTIBAN.DESCRIPTION,
				usage: '<...user> [--report] [--nsfw] [--days=3]',
				examples: ['81440962496172032 83886770768314368'],
			},
			category: 'mod',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			clientPermissions: [
				Permissions.FLAGS.BAN_MEMBERS,
				Permissions.FLAGS.MANAGE_GUILD,
				Permissions.FLAGS.ATTACH_FILES,
			],
			ratelimit: 2,
			flags: ['--report', '-r'],
			channel: 'guild',
			args: [
				{
					id: 'targets',
					type: Argument.union('member', 'string'),
					match: 'separate',
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.MOD.MULTIBAN.PROMPT.START(message.author),
					},
				},
				{
					id: 'report',
					match: 'flag',
					flag: ['--report', '-r'],
				},
				{
					id: 'nsfw',
					match: 'flag',
					flag: ['--nsfw'],
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days=', '-d='],
					default: 1,
				},
			],
		});
	}

	public async exec(
		message: Message,
		{
			targets,
			report,
			days,
			nsfw,
		}: { targets: Array<GuildMember | string>; report: boolean; days: number; nsfw: boolean },
	) {
		days = Math.min(Math.max(days, 0), 7);
		const guild = message.guild!;

		message.channel.startTyping();
		await guild.members.fetch();

		let invalidInput = 0;
		let currentlyManaged = 0;
		let notManageable = 0;
		let alreadyBanned = 0;

		const validTargets: Collection<string, User> = new Collection();

		const bans = await guild.fetchBans();
		for (const value of targets) {
			const member = value instanceof GuildMember ? value : guild.member(value);
			if (member) {
				if (!member.bannable || member.roles.highest.position >= message.member!.roles.highest.position) {
					notManageable++;
					continue;
				}

				const key = `${guild.id}:${member.id}:BAN`;
				if (this.client.caseHandler.cachedCases.has(key)) {
					currentlyManaged++;
					continue;
				}

				validTargets.set(member.id, member.user);
				continue;
			}

			try {
				const user = await this.client.users.fetch(value as string);
				if (bans.has(user.id)) {
					alreadyBanned++;
					continue;
				}
				validTargets.set(user.id, user);
			} catch {
				invalidInput++;
			}
		}

		const parts: string[] = [];

		if (!validTargets.size) {
			parts.push(MESSAGES.COMMANDS.MOD.MULTIBAN.FAIL.VALID_USER);
		}

		const filteredSum = invalidInput + currentlyManaged + notManageable + alreadyBanned;
		if (filteredSum) {
			parts.push(MESSAGES.COMMANDS.MOD.MULTIBAN.INVALID.FILTERED);
		}

		if (invalidInput) {
			parts.push(MESSAGES.COMMANDS.MOD.MULTIBAN.INVALID.INPUT(invalidInput));
		}

		if (currentlyManaged) {
			parts.push(MESSAGES.COMMANDS.MOD.MULTIBAN.INVALID.MANAGED(currentlyManaged));
		}

		if (notManageable) {
			parts.push(MESSAGES.COMMANDS.MOD.MULTIBAN.INVALID.MANAGEABLE(notManageable));
		}

		if (alreadyBanned) {
			parts.push(MESSAGES.COMMANDS.MOD.MULTIBAN.INVALID.BANNED(alreadyBanned));
		}

		if (!validTargets.size) {
			message.channel.stopTyping();
			return message.channel.send(parts.join('\n'));
		}

		const validTargetString = validTargets.map((u) => `\`${u.tag}\``).join(', ');
		message.channel.stopTyping();
		message.channel
			.send(
				`${MESSAGES.COMMANDS.MOD.MULTIBAN.PROMPT.CONFIRMATION(message.author, validTargetString)} (y/n)${
					parts.length ? `\n${parts.join('\n')}` : ''
				}`,
				{
					split: true,
				},
			)
			.catch((err) => console.error(err, err._errors));

		const filter = (m: Message) =>
			m.author.id === message.author.id && ['y', 'yes', 'n', 'no'].includes(m.content.toLowerCase());

		try {
			const collected = await message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
			if (['yes', 'y'].includes(collected.first()!.content)) {
				const survivors: Collection<string, User> = new Collection();
				const confirmed: Collection<string, User> = new Collection();

				message.channel.startTyping();

				let i = 0;
				for (const user of validTargets.values()) {
					try {
						const key = `${guild.id}:${user.id}:BAN`;
						await guild.caseQueue.add(async () =>
							new BanAction({
								message,
								member: user,
								keys: key,
								reason: `Multi ban \`(${++i}/${validTargets.size})\``,
								days,
								nsfw,
								skipPrompt: true,
								skipResponse: true,
								overrideColor: COLORS.ANTIRAID,
							}).commit(),
						);
						confirmed.set(user.id, user);
					} catch (err) {
						this.client.logger.error(err, { topic: TOPICS.DISCORD, event: EVENTS.COMMAND_ERROR });
						survivors.set(user.id, user);
					}
				}

				const confirmedString = confirmed.map((u: User) => `\`${u.tag}\``).join(', ');
				const survivorString = survivors.map((u: User) => `\`${u.tag}\``).join(', ');

				await message.channel.send(
					MESSAGES.COMMANDS.MOD.MULTIBAN.SUCCESS(confirmedString || 'none', survivorString || 'none'),
					{ split: true },
				);

				if (report) {
					const buffer = Buffer.from(confirmed.map((u) => u.id).join('\r\n'));
					const d = moment.utc().format(DATE_FORMAT_LOGFILE);
					const attachment = new MessageAttachment(buffer, `${d} multiban-report.txt`);

					return message.channel.send(MESSAGES.COMMANDS.MOD.MULTIBAN.REPORT, [attachment]);
				}
				return null;
			}
			return message.channel.send(MESSAGES.COMMANDS.MOD.MULTIBAN.FAIL.CONFIRMATION);
		} catch {
			message.channel.send(MESSAGES.COMMANDS.MOD.MULTIBAN.FAIL.TIMEOUT);
		} finally {
			message.channel.stopTyping();
		}

		return null;
	}
}
