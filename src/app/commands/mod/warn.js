const { Command } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class WarnCommand extends Command {
	constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to warn?',
						retry: 'please mention a valid GuildMember...'
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
				content: 'Warns a user, duh.',
				usage: '<member> <...reason>',
				examples: ['@Suvajit dumb', '444432489818357760 nsfw']
			}
		});
	}

	async exec(message, { member, reason }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) return;
		if (member.roles.has(staffRole)) return;

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;
		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member, action: 'Warn', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.WARN);
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
			action: CONSTANTS.ACTIONS.WARN,
			reason,
			createdAt: moment.utc().toDate()
		});

		return message.util.send(`Successfully warned **${member.user.tag}**`);
	}
}

module.exports = WarnCommand;
