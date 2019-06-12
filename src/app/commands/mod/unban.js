const { Command } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class UnbanCommand extends Command {
	constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Unbans a user, duh.',
				usage: '<member> <...reason>',
				examples: ['@Suvajit', '444432489818357760']
			},
			args: [
				{
					id: 'user',
					type: async (msg, id) => {
						const user = await this.client.users.fetch(id).catch(() => null);
						return user ? user : null;
					},
					prompt: {
						start: 'what member do you want to unban?',
						retry: 'please mention a valid ClientUser...'
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

	async exec(message, { user, reason }) {
		if (user.id === message.author.id) return;

		const cache = `CASE:${message.guild.id}:${user.id}:UNBAN`;
		if (this.client.cached.has(cache)) return;
		this.client.cached.add(cache);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		try {
			await message.guild.members.unban(user, `Unbanned by ${message.author.tag} (Case #${totalCases})`);
		} catch (error) {
			this.client.cached.delete(cache);
			return message.reply(`there was an error unbanning this user: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member: user, action: 'Unban', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.UNBAN);
			msg = await this.client.channels.get(modLog).send(embed);
		}

		await Case.create({
			case_id: totalCases,
			target_id: user.id,
			target_tag: user.tag,
			mod_tag: message.author.tag,
			mod_id: message.author.id,
			guild: message.guild.id,
			message: msg ? msg.id : undefined,
			action: CONSTANTS.ACTIONS.UNBAN,
			reason,
			createdAt: moment.utc().toDate()
		});

		return message.util.send(`Successfully unbanned **${user.tag}**`);
	}
}

module.exports = UnbanCommand;
