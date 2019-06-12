const { Command, Argument } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const Case = require('../../models/cases');
const ms = require('ms');

class DurationCommand extends Command {
	constructor() {
		super('duration', {
			aliases: ['duration'],
			category: 'mod',
			description: {
				content: 'Sets the duration for a mute and reschedules it.',
				usage: '<case> <duration>',
				examples: ['1234 30m', 'latest 20h']
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: 'what case do you want to add a reason to?',
						retry: 'please enter a case number...'
					}
				},
				{
					id: 'duration',
					type: (msg, str) => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: 'for how long do you want the mute to last?',
						retry: 'please use a proper time format.'
					}
				}
			]
		});
	}

	async exec(message, { caseNum, duration }) {
		const total_case = this.client.settings.get(message.guild, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' ? total_case : caseNum;
		if (isNaN(caseToFind)) return message.reply('please provide a correct case number.');
		const db = await Case.findOne({ where: { case_id: caseToFind, guild: message.guild.id, action: 5, action_processed: false } });
		if (!db) {
			return message.reply('I couldn\'t find a case with that Id!');
		}
		if (db.mod_id !== message.author.id && !message.member.permissions.has('MANAGE_GUILD')) {
			return message.reply('you can\'t set duration for this case.');
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		if (modLog) {
			const caseEmbed = await this.client.channels.get(modLog).messages.fetch(db.message);
			if (!caseEmbed) return message.reply('looks like the message doesn\'t exist anymore!');
			const embed = new MessageEmbed(caseEmbed.embeds[0])
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL());
			if (db.action_duration) {
				embed.setDescription(caseEmbed.embeds[0].description.replace(/\*\*Length:\*\* (.+)*/, `**Length:** ${ms(duration, { long: true })}`));
			} else {
				embed.setDescription(caseEmbed.embeds[0].description.replace(/(\*\*Action:\*\* Mute)/, `$1\n**Length:** ${ms(duration, { long: true })}`));
			}
			await caseEmbed.edit({ embed });
		}

		await db.update({
			mod_tag: message.author.tag,
			mod_id: message.author.id,
			action_duration: new Date(Date.now() + duration),
			createdAt: new Date(Date.now())
		});

		await this.client.muteScheduler.rescheduleMute(db);

		return message.util.send(`Successfully updated duration for case **#${caseToFind}**`);
	}
}

module.exports = DurationCommand;
