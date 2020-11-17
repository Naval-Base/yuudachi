import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message, Permissions, MessageAttachment } from 'discord.js';
import { MESSAGES, DATE_FORMAT_LOGFILE } from '../../util/constants';
import { EVENTS, TOPICS } from '../../util/logger';
import * as moment from 'moment';

export default class LaunchCybernukeCommand extends Command {
	public constructor() {
		super('cybernuke', {
			aliases: ['cybernuke', 'launch-cybernuke'],
			description: {
				content: MESSAGES.COMMANDS.UTIL.CYBERNUKE.DESCRIPTION,
				usage: '<join> <age>',
				examples: ['10 120'],
			},
			category: 'util',
			userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
			clientPermissions: [Permissions.FLAGS.BAN_MEMBERS],
			ratelimit: 2,
			args: [
				{
					id: 'join',
					type: Argument.range('number', 0.1, 120, true),
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT.RETRY(message.author),
					},
				},
				{
					id: 'age',
					type: Argument.range('number', 0.1, Infinity, true),
					prompt: {
						start: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT_2.START(message.author),
						retry: (message: Message) => MESSAGES.COMMANDS.UTIL.CYBERNUKE.PROMPT_2.RETRY(message.author),
					},
				},
				{
					id: 'report',
					match: 'flag',
					flag: ['--report', '-r'],
				},
			],
		});
	}

	public async exec(message: Message, { join, age, report }: { join: number; age: number; report: boolean }) {
		const guild = message.guild!;
		await message.util?.send('Calculating targeting parameters for cybernuke...');
		await guild.members.fetch();

		const memberCutoff = Date.now() - join * 60000;
		const ageCutoff = Date.now() - age * 60000;
		const members = guild.members.cache.filter(
			(member) => (member.joinedTimestamp ?? 0) > memberCutoff && member.user.createdTimestamp > ageCutoff,
		);

		await message.util?.send(`Cybernuke will strike ${members.size} members; proceed?`);
		let statusMessage: Message | undefined;

		const responses = await message.channel.awaitMessages((msg: Message) => msg.author.id === message.author.id, {
			max: 1,
			time: 10000,
		});

		if (responses?.size !== 1) {
			await message.reply('Cybernuke cancelled.');
			return null;
		}
		const response = responses.first();

		if (/^y(?:e(?:a|s)?)?$/i.test(response?.content ?? '')) {
			statusMessage = await response?.reply('Launching cybernuke...');
		} else {
			await response?.reply('Cybernuke cancelled.');
			return null;
		}

		const fatalities: GuildMember[] = [];
		const survivors: { member: GuildMember; error: Error }[] = [];
		const promises: Promise<Message | void>[] = [];

		for (const member of members.values()) {
			promises.push(
				member
					.send(
						stripIndents`
					Sorry, but you've been automatically targeted by the cybernuke in the "${guild.name}" server.
					This means that you have been banned, likely in the case of a server raid.
					Please contact them if you believe this ban to be in error.
				`,
					)
					.catch((error: any) =>
						this.client.logger.error(error, { topic: TOPICS.DISCORD, event: EVENTS.COMMAND_ERROR }),
					)
					.then(async () => member.ban({ days: 7, reason: 'Cybernuke!' }))
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
		await response?.reply(
			stripIndents`
			__**Fatalities:**__

			${
				fatalities.length > 0
					? stripIndents`
					${fatalities.length} confirmed KIA.
					${fatalities.map((fat) => `**-** ${fat.displayName} (${fat.id})`).join('\n')}
				`
					: 'None'
			}
			${
				survivors.length > 0
					? stripIndents`
					__**Survivors**__
					${survivors.length} left standing.
					${survivors.map((srv) => `**-** ${srv.member.displayName} (${srv.member.id}): \`${srv.error}\``).join('\n')}
				`
					: ''
			}
		`,
			{ split: true },
		);

		if (report) {
			const buffer = Buffer.from(fatalities.map((u) => u.id).join('\r\n'));
			const d = moment.utc().format(DATE_FORMAT_LOGFILE);
			const attachment = new MessageAttachment(buffer, `${d} cybernuke-report.txt`);

			await message.channel.send(MESSAGES.COMMANDS.UTIL.CYBERNUKE.REPORT, [attachment]);
		}

		return null;
	}
}
