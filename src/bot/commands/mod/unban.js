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

class UnbanCommand extends Command {
	constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'mod',
			description: {
				content: '.',
				usage: '<member> <...reason>',
				examples: ['unban @Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'user',
					type: async id => {
						const user = await this.client.users.fetch(id);
						return user;
					},
					prompt: {
						start: message => `${message.author}, what member do you want to unban?`,
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

	async exec(message, { user, reason }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		if (!staffRole) return message.util.send('You know, I know, we should just leave it at that.');

		const key = `${message.guild.id}:${user.id}:UNBAN`;
		if (this.client._cachedCases.has(key)) {
			return message.util.send('That user is currently being moderated by someone else.');
		}
		this.client._cachedCases.add(key);

		await message.guild.members.unban(user, `Unbanned by ${message.author.tag}`);

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
					**Member:** ${user.tag} (${user.id})
					**Action:** Unban
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
			target_id: user.id,
			target_tag: user.tag,
			mod_id: message.author.id,
			mod_tag: message.author.tag,
			action: ACTIONS.UNBAN,
			reason
		});

		return message.util.send(`Successfully unbanned ${user.tag}`);
	}
}

module.exports = UnbanCommand;
