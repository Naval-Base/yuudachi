const { Command } = require('discord-akairo');
const { logEmbed, CONSTANTS } = require('../../util/utils');
const ms = require('ms');

class MuteCommand extends Command {
	constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'mod',
			description: {
				content: 'Mutes a member, duh.',
				usage: '<member> <duration> <...reason>',
				examples: ['@Suavjit']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to mute?',
						retry: 'please mention a valid GuildMember...'
					}
				},
				{
					id: 'duration',
					type: (msg, str) => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: 'for how long do you want the mute to last?',
						retry: 'please use a proper time format.'
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

	async exec(message, { member, duration, reason }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) return;
		if (member.roles.has(staffRole)) return;

		const muteRole = this.client.settings.get(message.guild, 'muteRole', undefined);
		if (!muteRole) return message.reply('there is no mute role configured on this server.');

		const cache = `CASE:${message.guild.id}:${member.id}:MUTE`;
		if (this.client.cached.has(cache)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cached.add(cache);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		try {
			await member.roles.add(muteRole, `Muted by ${message.author.tag} (Case #${totalCases})`);
		} catch (error) {
			this.client.cached.delete(cache);
			return message.reply(`there was an error muting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member, action: 'Mute', duration, caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.MUTE);
			msg = await this.client.channels.get(modLog).send(embed);
		}

		await this.client.muteScheduler.addMute({
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author.id,
			mod_tag: message.author.tag,
			guild: message.guild.id,
			action: CONSTANTS.ACTIONS.MUTE,
			action_duration: new Date(Date.now() + duration),
			action_processed: false,
			reason,
			message: msg ? msg.id : null
		});

		return message.util.send(`Successfully muted **${member.user.tag}**`);
	}
}

module.exports = MuteCommand;
