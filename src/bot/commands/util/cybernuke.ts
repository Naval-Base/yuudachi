import { stripIndents } from 'common-tags';
import { Argument, Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import { MESSAGES } from '../../util/constants';
import { EVENTS, TOPICS } from '../../util/logger';

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
			userPermissions: ['MANAGE_GUILD'],
			clientPermissions: ['BAN_MEMBERS'],
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
			],
		});
	}

	public async exec(message: Message, { join, age }: { join: number; age: number }) {
		await message.util!.send('Calculating targeting parameters for cybernuke...');
		await message.guild!.members.fetch();

		const memberCutoff = Date.now() - join * 60000;
		const ageCutoff = Date.now() - age * 60000;
		const members = message.guild!.members.filter(
			member => member.joinedTimestamp! > memberCutoff && member.user.createdTimestamp > ageCutoff,
		);

		await message.util!.send(`Cybernuke will strike ${members.size} members; proceed?`);
		let statusMessage: Message;

		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author!.id, {
			max: 1,
			time: 10000,
		});

		if (!responses || responses.size !== 1) {
			await message.reply('Cybernuke cancelled.');
			return null;
		}
		const response = responses.first();

		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			statusMessage = await response!.reply('Launching cybernuke...');
		} else {
			await response!.reply('Cybernuke cancelled.');
			return null;
		}

		const fatalities: GuildMember[] = [];
		const survivors: { member: GuildMember; error: Error }[] = [];
		const promises: Promise<Message | void>[] = [];

		for (const member of members.values()) {
			/* eslint-disable promise/prefer-await-to-then, promise/always-return, promise/prefer-await-to-callbacks */
			promises.push(
				member
					.send(
						stripIndents`
					Sorry, but you've been automatically targetted by the cybernuke in the "${message.guild!.name}" server.
					This means that you have been banned, likely in the case of a server raid.
					Please contact them if you believe this ban to be in error.
				`,
					)
					.catch(error => this.client.logger.error(error, { topic: TOPICS.DISCORD, event: EVENTS.COMMAND_ERROR }))
					.then(async () => member.ban())
					.then(() => {
						fatalities.push(member);
					})
					.catch(err => {
						this.client.logger.error(err, { topic: TOPICS.DISCORD, event: EVENTS.COMMAND_ERROR });
						survivors.push({
							member,
							error: err,
						});
					})
					.then(async () => {
						if (members.size <= 5) return;
						if (promises.length % 5 === 0) {
							await statusMessage.edit(
								`Launching cyber nuke (${Math.round((promises.length / members.size) * 100)}%)...`,
							);
						}
					}),
			);
			/* eslint-enable promise/prefer-await-to-then, promise/always-return, promise/prefer-await-to-callbacks */
		}

		await Promise.all(promises);
		await statusMessage.edit('Cybernuke impact confirmed. Casuality report incoming...');
		await response!.reply(
			stripIndents`
			__**Fatalities:**__

			${
				fatalities.length > 0
					? stripIndents`
					${fatalities.length} confirmed KIA.
					${fatalities.map(fat => `**-** ${fat.displayName} (${fat.id})`).join('\n')}
				`
					: 'None'
			}
			${
				survivors.length > 0
					? stripIndents`
					__**Survivors**__
					${survivors.length} left standing.
					${survivors.map(srv => `**-** ${srv.member.displayName} (${srv.member.id}): \`${srv.error}\``).join('\n')}
				`
					: ''
			}
		`,
			{ split: true },
		);

		return null;
	}
}
