const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const ms = require('@naval-base/ms');

const ACTIONS = {
	BAN: 1,
	UNBAN: 2,
	SOFTBAN: 3,
	KICK: 4,
	MUTE: 5,
	EMBED: 6,
	EMOJI: 7,
	REACTION: 8
};

class MuteCommand extends Command {
	constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'mod',
			description: {
				content: '.',
				usage: '<member> <duration> <...reason>',
				examples: ['mute @Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: message => `${message.author}, what member do you want to mute?`,
						retry: message => `${message.author}, please mention a member.`
					}
				},
				{
					id: 'duration',
					type: str => {
						const duration = ms(str);
						// 300000
						if (duration && duration >= 30000) return duration;
						return null;
					},
					prompt: {
						start: message => `${message.author}, for how long do you want the mute to last?`,
						retry: message => `${message.author}, please use a proper time format.`
					}
				},
				{
					'id': 'reason',
					'match': 'rest',
					'type': 'string',
					'default': ''
				}
			]
		});
	}

	async exec(message, { member, duration, reason }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		if (!staffRole) return message.util.send('You know, I know, we should just leave it at that.');
		if (member.roles.has(staffRole)) {
			return message.util.send('Nuh-uh! You know you can\'t do this.');
		}

		const muteRole = this.client.settings.get(message.guild, 'mutedRole');
		if (!muteRole) return message.util.send('There is no mute role configured on this server.');

		const key = `${message.guild.id}:${member.id}:MUTE`;
		if (this.client._cachedCases.has(key)) {
			return message.util.send('That user is currently being moderated by someone else.');
		}
		this.client._cachedCases.add(key);

		try {
			await member.roles.add(muteRole, `Muted by ${message.author.tag}`);
		} catch (error) {
			this.client._cachedCases.delete(key);
			return message.util.send(`There was an error muting this member: \`${error}\``);
		}

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;
		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get(message.guild, 'modLogChannel');
		let modMessage;
		if (modLogChannel) {
			const embed = new MessageEmbed()
				.setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setDescription(stripIndents`
					**Member:** ${member.user.tag} (${member.id})
					**Action:** Mute
					**Length:** ${ms(duration, { 'long': true })}
					**Reason:** ${reason}
				`)
				.setFooter(`Case ${totalCases}`)
				.setTimestamp(new Date());
			modMessage = await this.client.channels.get(modLogChannel).send(embed);
		}
		await this.client.muteScheduler.addMute({
			guild: message.guild.id,
			message: modMessage ? modMessage.id : null,
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author.id,
			mod_tag: message.author.tag,
			action: ACTIONS.MUTE,
			action_duration: new Date(Date.now() + duration),
			action_processed: false,
			reason
		});

		return message.util.send(`Successfully muted ${member.user.tag}`);
	}
}

module.exports = MuteCommand;
