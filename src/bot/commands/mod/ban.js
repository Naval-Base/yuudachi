const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const { CONSTANTS: { ACTIONS, COLORS }, logEmbed, historyEmbed } = require('../../util');

class BanCommand extends Command {
	constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			description: {
				content: '.',
				usage: '<member> <...reason>',
				examples: ['ban @Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: message => `${message.author}, what member do you want to ban?`,
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
		const key = `${message.guild.id}:${member.id}:BAN`;
		if (this.client._cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client._cachedCases.add(key);

		const dbCases = await this.client.db.models.cases.findAll({ where: { target_id: member.id } });
		const embed = historyEmbed(member, dbCases);
		await message.channel.send('You sure you want me to ban this guy?', { embed });
		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
			max: 1,
			time: 10000
		});

		if (!responses || responses.size !== 1) {
			this.client._cachedCases.delete(key);
			return message.reply('timed out. Cancelled ban.');
		}
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response.content)) {
			sentMessage = await message.channel.send(`Banning **${member.user.tag}**...`);
		} else {
			this.client._cachedCases.delete(key);
			return message.reply('cancelled ban.');
		}

		try {
			try {
				await member.send(stripIndents`
					**You have been banned from ${message.guild.name}**
					${reason ? `\n**Reason:** ${reason}\n` : ''}
					You can appeal your ban by DMing \`Crawl#0002\` with a message why you think you deserve to have your ban lifted.
				`);
			} catch {}
			await member.ban(`Banned by ${message.author.tag}`);
		} catch (error) {
			this.client._cachedCases.delete(key);
			return message.reply(`there was an error banning this member: \`${error}\``);
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
			const embed = logEmbed({ message, member, action: 'Ban', caseNum: totalCases, reason }).setColor(COLORS.BAN);
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
			action: ACTIONS.BAN,
			reason
		});

		return sentMessage.edit(`Successfully banned **${member.user.tag}**`);
	}
}

module.exports = BanCommand;
