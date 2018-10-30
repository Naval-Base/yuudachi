const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

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

class KickCommand extends Command {
	constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'mod',
			description: {
				content: '.',
				usage: '<member> <...reason>',
				examples: ['kick @Crawl', 'kick @Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: message => `${message.author}, what member do you want to kick?`,
						retry: message => `${message.author}, please mention a member.`
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

	async exec(message, { member, reason }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		if (!staffRole) return message.util.send('You know, I know, we should just leave it at that.');
		if (member.roles.has(staffRole)) {
			return message.util.send('Nuh-uh! You know you can\'t do this.');
		}

		await member.kick(`Kicked by ${message.author.tag}`);

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
					**Action:** Kick
					**Reason:** ${reason}
				`)
				.setFooter(`Case ${totalCases}`)
				.setTimestamp(new Date());
			modMessage = await this.client.channels.get(modLogChannel).send(embed);
		}
		await this.client.db.models.cases.create({
			guild: message.guild.id,
			message: modMessage ? modMessage.id : null,
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author.id,
			mod_tag: message.author.tag,
			action: ACTIONS.KICK,
			reason
		});

		return message.util.send(`Successfully kicked ${member.user.tag}`);
	}
}

module.exports = KickCommand;
