const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const ms = require('@naval-base/ms');

const ACTIONS = {
	BAN: 1,
	SOFTBAN: 2,
	KICK: 3,
	MUTE: 4,
	EMBED: 5,
	EMOJI: 6,
	REACTION: 7
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
			/* userPermissions: ['MANAGE_ROLES'],
			clientPermissions: ['MANAGE_ROLES'], */
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
		if (member.roles.has(staffRole)) {
			return;
		}

		const muteRole = this.client.settings.get(message.guild, 'mutedRole');
		if (!muteRole) return;
		await member.roles.add(muteRole, `Muted by ${message.author.tag}`);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;
		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			reason = `Use \`-reason ${totalCases} <...reason>\` to set a reason for this case`;
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
