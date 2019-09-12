import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { ACTIONS } from '../../util';
const ms = require('@naval-base/ms'); // eslint-disable-line

export default class DurationCommand extends Command {
	public constructor() {
		super('duration', {
			aliases: ['duration'],
			category: 'mod',
			description: {
				content: 'Sets the duration for a mute and reschedules it.',
				usage: '<case> <duration>',
				examples: ['1234 30m', 'latest 20h']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message) => `${message.author}, what case do you want to add a reason to?`,
						retry: (message: Message) => `${message.author}, please enter a case number.`
					}
				},
				{
					id: 'duration',
					type: (_, str) => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => `${message.author}, for how long do you want the mute to last?`,
						retry: (message: Message) => `${message.author}, please use a proper time format.`
					}
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get<string>(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { caseNum, duration }: { caseNum: number | string; duration: number }) {
		const totalCases = this.client.settings.get<number>(message.guild!, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : caseNum as number;
		if (isNaN(caseToFind)) return message.reply('at least provide me with a correct number.');
		const dbCase = await this.client.caseHandler.repo.findOne({ case_id: caseToFind, action: ACTIONS.MUTE, action_processed: false });
		if (!dbCase) {
			return message.reply('I looked where I could, but I couldn\'t find a case with that Id and action, maybe look for something that actually exists next time!');
		}
		if (dbCase.mod_id !== message.author!.id && !message.member!.permissions.has('MANAGE_GUILD')) {
			return message.reply('you\'d be wrong in thinking I would let you fiddle with other peoples achievements!');
		}

		const modLogChannel = this.client.settings.get<string>(message.guild!, 'modLogChannel', undefined);
		if (modLogChannel) {
			let caseEmbed;
			if (dbCase.message) caseEmbed = await (this.client.channels.get(modLogChannel) as TextChannel).messages.fetch(dbCase.message);
			if (!caseEmbed) return message.reply('looks like the message doesn\'t exist anymore!');
			const embed = new MessageEmbed(caseEmbed.embeds[0]);
			if (dbCase.action_duration) {
				embed.setDescription(caseEmbed.embeds[0].description.replace(/\*\*Length:\*\* (.+)*/, `**Length:** ${ms(duration, { 'long': true })}`));
			} else {
				embed.setDescription(caseEmbed.embeds[0].description.replace(/(\*\*Action:\*\* Mute)/, `$1\n**Length:** ${ms(duration, { 'long': true })}`));
			}
			await caseEmbed.edit(embed);
		}
		dbCase.action_duration = new Date(Date.now() + duration);
		await this.client.caseHandler.repo.save(dbCase);
		this.client.muteScheduler.reschedule(dbCase);

		return message.util!.send(`Successfully updated duration for case **#${caseToFind}**`);
	}
}
