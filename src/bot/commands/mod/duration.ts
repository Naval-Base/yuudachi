import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';
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
						start: (message: Message): string => `${message.author}, what case do you want to add a reason to?`,
						retry: (message: Message): string => `${message.author}, please enter a case number.`
					}
				},
				{
					id: 'duration',
					type: (_, str): number | null => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message): string => `${message.author}, for how long do you want the mute to last?`,
						retry: (message: Message): string => `${message.author}, please use a proper time format.`
					}
				}
			]
		});
	}

	// @ts-ignore
	public userPermissions(message: Message): string | null {
		const staffRole = this.client.settings.get(message.guild!, 'modRole', undefined);
		const hasStaffRole = message.member!.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { caseNum, duration }: { caseNum: number | string; duration: number }): Promise<Message | Message[]> {
		const totalCases = this.client.settings.get(message.guild!, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : caseNum;
		if (isNaN(caseToFind)) return message.reply('at least provide me with a correct number.');
		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = await casesRepo.findOne({ case_id: caseToFind, action: Util.CONSTANTS.ACTIONS.MUTE, action_processed: false });
		if (!dbCase) {
			return message.reply('I looked where I could, but I couldn\'t find a case with that Id and action, maybe look for something that actually exists next time!');
		}
		if (dbCase.mod_id !== message.author!.id && !message.member!.permissions.has('MANAGE_GUILD')) {
			return message.reply('you\'d be wrong in thinking I would let you fiddle with other peoples achievements!');
		}

		const modLogChannel = this.client.settings.get(message.guild!, 'modLogChannel', undefined);
		if (modLogChannel) {
			const caseEmbed = await (this.client.channels.get(modLogChannel) as TextChannel).messages.fetch(dbCase.message) as Message;
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
		await casesRepo.save(dbCase);
		this.client.muteScheduler.rescheduleMute(dbCase);

		return message.util!.send(`Successfully updated duration for case **#${caseToFind}**`);
	}
}
