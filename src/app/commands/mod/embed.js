const { Command } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class RestrictEmbedCommand extends Command {
	constructor() {
		super('restrict-embed', {
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to restrict?',
						retry: 'please mention a member.'
					}
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: ''
				}
			],
			description: {
				content: 'Restrict a members ability to post embeds/upload files.',
				usage: '<member> <...reason>',
				examples: []
			}
		});
	}

	async exec(message, { member, reason }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) return;
		if (member.roles.has(staffRole)) return;

		const restrictRoles = this.client.settings.get(message.guild, 'restrictRoles', undefined);
		if (!restrictRoles) return message.reply('there are no restricted roles configured on this server.');

		const cache = `${message.guild.id}:${member.id}:EMBED`;
		if (this.client.cached.has(cache)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cached.add(cache);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		try {
			await member.roles.add(restrictRoles.embed, `Embed restricted by ${message.author.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cached.delete(cache);
			return message.reply(`there was an error embed retricting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member, action: 'Embed Restriction', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.EMBED);
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
			action: CONSTANTS.ACTIONS.EMBED,
			reason,
			createdAt: moment.utc().toDate()
		});

		return message.util.send(`Successfully embed restricted **${member.user.tag}**`);
	}
}

module.exports = RestrictEmbedCommand;
