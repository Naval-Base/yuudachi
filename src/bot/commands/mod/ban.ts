import { Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class BanCommand extends Command {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			description: {
				content: 'Bans a member, duh.',
				usage: '<member> <...reason>',
				examples: ['@Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to ban?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days', '-d'],
					default: 7
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

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		const hasStaffRole = message.member.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { member, days, reason }: { member: GuildMember, days: number, reason: string }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) {
			await message.reply('you asked for it, ok?');
			try {
				await member.kick(`${message.author.tag} used a mod command on themselves.`);
			} catch {} // tslint:disable-line
			return;
		}
		if (member.roles.has(staffRole)) {
			return message.reply('nuh-uh! You know you can\'t do this.');
		}
		const key = `${message.guild.id}:${member.id}:BAN`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cachedCases.add(key);

		const casesRepo = this.client.db.getRepository(Case);
		const dbCases = await casesRepo.find({ target_id: member.id });
		const embed = Util.historyEmbed(member, dbCases);
		await message.channel.send('You sure you want me to ban this [no gender specified]?', { embed });
		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
			max: 1,
			time: 10000
		});

		if (!responses || responses.size !== 1) {
			this.client.cachedCases.delete(key);
			return message.reply('timed out. Cancelled ban.');
		}
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			sentMessage = await message.channel.send(`Banning **${member.user.tag}**...`) as Message;
		} else {
			this.client.cachedCases.delete(key);
			return message.reply('cancelled ban.');
		}

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) as number + 1;

		try {
			try {
				await member.send(stripIndents`
					**You have been banned from ${message.guild.name}**
					${reason ? `\n**Reason:** ${reason}\n` : ''}
					You can appeal your ban by DMing \`Crawl#0002\` with a message why you think you deserve to have your ban lifted.
				`);
			} catch {} // tslint:disable-line
			await member.ban({ days, reason: `Banned by ${message.author.tag} | Case #${totalCases}` });
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`there was an error banning this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get(message.guild, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = Util.logEmbed({ message, member, action: 'Ban', caseNum: totalCases, reason }).setColor(Util.CONSTANTS.COLORS.BAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed) as Message;
		}

		const dbCase = new Case();
		dbCase.guild = message.guild.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author.id;
		dbCase.mod_tag = message.author.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.BAN;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return sentMessage.edit(`Successfully banned **${member.user.tag}**`);
	}
}
