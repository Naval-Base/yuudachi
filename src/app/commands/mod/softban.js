const { Command } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class SoftbanCommand extends Command {
	constructor() {
		super('softban', {
			aliases: ['softban'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Softbans a member, duh.',
				usage: '<member> <...reason>',
				examples: ['@Suvajit userbot', '444432489818357760 spam']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to softban?',
						retry: 'please mention a valid GuildMember...'
					}
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async exec(message, { member, reason }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) return;
		if (member.roles.has(staffRole)) return;

		const caches = [`CASE:${message.guild.id}:${member.id}:BAN`, `CASE:${message.guild.id}:${member.id}:UNBAN`];
		if (this.client.cached.has(caches[0]) && this.client.cached.has(caches[1])) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cached.add(caches[0]);
		this.client.cached.add(caches[1]);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		let sentMessage;
		try {
			sentMessage = await message.channel.send(`Softbanning **${member.user.tag}...**`);
			try {
				await member.send(`You have been softbanned from **${message.guild.name}**`);
			} catch {} // eslint-disable-line
			await member.ban({ days: 1, reason: `Softbanned by ${message.author.tag} (Case #${totalCases})` });
			await message.guild.members.unban(member, `Softbanned by ${message.author.tag} (Case #${totalCases})`);
		} catch (error) {
			this.client.cached.delete(caches[0]);
			this.client.cached.delete(caches[1]);
			return message.reply(`there was an error softbanning this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member, action: 'Softban', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.SOFTBAN);
			msg = await this.client.channels.get(modLog).send(embed);
		}

		await Case.create({
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_tag: message.author.tag,
			mod_id: message.author.id,
			guild: message.guild.id,
			message: msg ? msg.id : undefined,
			action: CONSTANTS.ACTIONS.SOFTBAN,
			reason,
			createdAt: moment.utc().toDate()
		});

		return sentMessage.edit(`Successfully softbanned **${member.user.tag}**`);
	}
}

module.exports = SoftbanCommand;
