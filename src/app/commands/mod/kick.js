const { Command } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class KickCommand extends Command {
	constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['KICK_MEMBERS', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Kicks a member, duh.',
				usage: '<member> <...reason>',
				examples: ['@Suvajit userbot', '444432489818357760 nsfw']
			},
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to kick?',
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

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		let confirm_msg;
		try {
			confirm_msg = await message.channel.send(`Kicking **${member.user.tag}...**`);
			try {
				await member.send(`You have been kicked from **${message.guild.name}**`);
			} catch {} // eslint-disable-line
			await member.kick(`Kicked by ${message.author.tag} (Case #${totalCases})`);
		} catch (error) {
			return message.reply(`there was an error kicking this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member, action: 'Kick', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.KICK);
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
			action: CONSTANTS.ACTIONS.KICK,
			reason,
			createdAt: moment.utc().toDate()
		});

		return confirm_msg.edit(`Successfully kicked **${member.user.tag}**`);
	}
}

module.exports = KickCommand;
