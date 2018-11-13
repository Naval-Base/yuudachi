import { Command } from 'discord-akairo';
import { Message, User, TextChannel } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class UnbanCommand extends Command {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'mod',
			description: {
				content: 'Unbans a user, duh.',
				usage: '<member> <...reason>',
				examples: ['@Crawl']
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'user',
					type: async id => {
						const user = await this.client.users.fetch(id);
						return user;
					},
					prompt: {
						start: (message: Message) => `${message.author}, what member do you want to unban?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
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

	// @ts-ignore
	public userPermissions(message: Message) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		const hasStaffRole = message.member.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(message: Message, { user, reason }: { user: User, reason: string }) {
		if (user.id === message.author.id) return;

		const key = `${message.guild.id}:${user.id}:UNBAN`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('that user is currently being moderated by someone else.');
		}
		this.client.cachedCases.add(key);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) as number + 1;

		try {
			await message.guild.members.unban(user, `Unbanned by ${message.author.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`there was an error unbanning this user: \`${error}\``);
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
			const embed = Util.logEmbed({ message, member: user, action: 'Unban', caseNum: totalCases, reason }).setColor(Util.CONSTANTS.COLORS.UNBAN);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed) as Message;
		}

		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = new Case();
		dbCase.guild = message.guild.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = user.id;
		dbCase.target_tag = user.tag;
		dbCase.mod_id = message.author.id;
		dbCase.mod_tag = message.author.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.UNBAN;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.util!.send(`Successfully unbanned **${user.tag}**`);
	}
}
