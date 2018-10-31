const { Command } = require('discord-akairo');
const { CONSTANTS: { ACTIONS, COLORS }, logEmbed } = require('../../util');

class RestrictReactionCommand extends Command {
	constructor() {
		super('restrict-reaction', {
			category: 'mod',
			description: {
				content: '.',
				usage: '<member> <...reason>',
				examples: ['restrict react @Crawl', 'restrict reaction @Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: message => `${message.author}, what member do you want to restrict?`,
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
		if (!this.client.settings.get(message.guild, 'moderation')) {
			return message.reply('moderation commands are disabled on this server.');
		}
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole'));
		if (!staffRole) return message.reply('you know, I know, we should just leave it at that.');
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}

		const key = `${message.guild.id}:${member.id}:REACTION`;
		if (this.client._cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client._cachedCases.add(key);

		try {
			// await member.roles.add('', `Embed restricted by ${message.author.tag}`);
		} catch (error) {
			this.client._cachedCases.delete(key);
			return message.reply(`there was an error muting this member: \`${error}\``);
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
			const embed = logEmbed({ message, member, action: 'Reaction restriction', caseNum: totalCases, reason }).setColor(COLORS.RESTRICT);
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
			action: ACTIONS.REACTION,
			reason
		});

		return message.util.send(`Successfully reaction restricted **${member.user.tag}**`);
	}
}

module.exports = RestrictReactionCommand;
