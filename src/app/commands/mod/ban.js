const { Command, Argument, Flag } = require('discord-akairo');
const { historyEmbed, logEmbed, CONSTANTS } = require('../../util/utils');
const Case = require('../../models/cases');
const moment = require('moment');

class BanCommand extends Command {
	constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			description: {
				content: 'Bans a member, duh.',
				usage: '<member> <...reason> [days]',
				examples: ['@Suvajit troll', '444432489818357760 troll --days:7']
			},
			optionFlags: ['--days', '-d']
		});
	}

	*args() {
		const member = yield {
			type: Argument.union('member', async (msg, id) => {
				const user = await this.client.users.fetch(id).catch(() => null);
				return user ? { id: user.id, user } : null;
			}),
			prompt: {
				start: 'what member do you want to ban?',
				retry: 'please mention valid a member...'
			}
		};

		const days = yield {
			type: 'integer',
			match: 'option',
			flag: ['--days', '-d'],
			default: 0
		};

		const reason = yield {
			match: 'rest',
			type: 'string',
			default: ''
		};

		const confirm = yield {
			match: 'none',
			type: (msg, phrase) => {
				if (!phrase) return null;
				if (/^y(?:e(?:a|s)?)?$/i.test(phrase)) return true;
				return null;
			},
			prompt: {
				modifyStart: async message => {
					const cases = await Case.findAll({ where: { target_id: member.id, guild: message.guild.id } });
					const embed = historyEmbed(member, cases);
					const content = 'You sure you want me to ban this user? (Y/N)';
					return { embed, content };
				},
				time: 10000,
				retries: 0,
				ended: message => `${message.author}, command has been cancelled.`
			}
		};

		return { member, days, reason, confirm };
	}

	async exec(message, { member, days, reason }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) return;
		if (member.roles && member.roles.has(staffRole)) return;

		const cache = `CASE:${message.guild.id}:${member.user.id}:BAN`;
		if (this.client.cached.has(cache)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cached.add(cache);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		try {
			try {
				await member.send(`You have been banned from **${message.guild.name}**`);
			} catch {} // eslint-disable-line
			await member.ban({ days, reason: `Banned by ${message.author.tag} (Case #${totalCases})` });
		} catch {
			try {
				await message.guild.members.ban(member.id, { days, reason: `Banned by ${message.author.tag} (Case #${totalCases})` });
			} catch (error) {
				this.client.cached.delete(cache);
				return message.reply(`there was an error banning this member: \`${error}\``);
			}
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case.`;
		}

		const modLog = this.client.settings.get(message.guild, 'modLog', undefined);
		let msg;
		if (modLog && this.client.channels.has(modLog)) {
			const embed = logEmbed({ message, member, action: 'Ban', caseNum: totalCases, reason }).setColor(CONSTANTS.COLORS.BAN);
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
			action: CONSTANTS.ACTIONS.BAN,
			reason,
			createdAt: moment.utc().toDate()
		});

		return message.util.send(`Successfully banned **${member.user.tag}**`);
	}
}

module.exports = BanCommand;
